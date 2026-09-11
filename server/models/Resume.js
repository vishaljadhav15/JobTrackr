const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    
    cloudinaryPublicId: {
      type: String,
      trim: true,
    },

    fileType: {
      type: String,
      enum: ["pdf"],
      required: true,
      default: "pdf",
    },

    fileSize: {
      type: Number,
      required: true,
      min: 0,
      max: 5 * 1024 * 1024,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    extractedText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Resume", resumeSchema);
