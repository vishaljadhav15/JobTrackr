const Resume = require("../models/Resume");
const fs = require("fs");
const path = require("path");
const parseResume = require("../services/resumeParser");
const extractSkills = require("../services/skillExtractor");
const cloudinary = require("../config/cloudinary");

const createResume = async (req, res) => {
  let uploadedPublicId = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume title is required",
      });
    }

    // Extract text from the uploaded PDF
    const extractedText = await parseResume(req.file.buffer);

    // Detect skills from extracted resume text
    const skills = extractSkills(extractedText);

    const fileNameWithoutExtension = path.parse(
      req.file.originalname,
    ).name;

    const publicId = `jobtrackr/resumes/${req.user._id}/${Date.now()}-${fileNameWithoutExtension}`;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id: publicId,
          format: "pdf",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(req.file.buffer);
    });

    uploadedPublicId = uploadResult.public_id;

    const resume = await Resume.create({
      user: req.user._id,
      title: title.trim(),
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      fileType: "pdf",
      fileSize: req.file.size,
      extractedText,
      skills,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        resume,
      },
    });
  } catch (error) {
    console.error("Create resume error:", error);

    // Remove the Cloudinary file if database creation fails
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "raw",
          type: "upload",
        });
      } catch (cleanupError) {
        console.error("Cloudinary cleanup error:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error while uploading resume",
    });
  }
};

const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        resumes,
      },
    });
  } catch (error) {
    console.error("Get resumes error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching resumes",
    });
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        resume,
      },
    });
  } catch (error) {
    console.error("Get resume error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching resume",
    });
  }
};

const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const { title, isDefault, skills } = req.body;

    if (title !== undefined) {
      resume.title = title.trim();
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array",
        });
      }

      resume.skills = skills
        .map((skill) => String(skill).trim())
        .filter(Boolean);
    }

    if (isDefault === true) {
      await Resume.updateMany(
        {
          user: req.user._id,
          _id: { $ne: resume._id },
        },
        {
          $set: { isDefault: false },
        }
      );

      resume.isDefault = true;
    }

    if (isDefault === false) {
      resume.isDefault = false;
    }

    const updatedResume = await resume.save();

    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: {
        resume: updatedResume,
      },
    });
  } catch (error) {
    console.error("Update resume error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating resume",
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Delete new resumes from Cloudinary
    if (resume.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(resume.cloudinaryPublicId, {
        resource_type: "raw",
        type: "upload",
      });
    } else if (resume.fileUrl?.startsWith("/uploads/")) {
      // Keep support for older locally stored resumes
      const filePath = path.join(
        __dirname,
        "..",
        resume.fileUrl.replace("/uploads/", ""),
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting resume",
    });
  }
};

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
};