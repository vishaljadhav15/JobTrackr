const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profile: {
      phone: {
        type: String,
        trim: true,
      },

      location: {
        type: String,
        trim: true,
      },

      headline: {
        type: String,
        trim: true,
        maxlength: 150,
      },

      bio: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      skills: [
        {
          type: String,
          trim: true,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);