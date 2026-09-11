const User = require("../models/User");

const getMyProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      headline,
      bio,
      skills,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.profile.phone = phone.trim();
    }

    if (location !== undefined) {
      user.profile.location = location.trim();
    }

    if (headline !== undefined) {
      user.profile.headline = headline.trim();
    }

    if (bio !== undefined) {
      user.profile.bio = bio.trim();
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array",
        });
      }

      user.profile.skills = skills
        .map((skill) => String(skill).trim())
        .filter(Boolean);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profile: updatedUser.profile,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};