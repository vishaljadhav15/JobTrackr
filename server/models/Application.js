const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Saved",
        "Applied",
        "Screening",
        "Interview",
        "Offer",
        "Accepted",
        "Rejected",
      ],
      default: "Saved",
      index: true,
    },

    appliedDate: {
      type: Date,
    },

    interviewDate: {
      type: Date,
    },

    followUpDate: {
      type: Date,
    },

    contactPerson: {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      email: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },
    },

    interviewRounds: [
      {
        round: {
          type: String,
          trim: true,
        },

        date: {
          type: Date,
        },

        status: {
          type: String,
          enum: ["Scheduled", "Completed", "Cancelled"],
          default: "Scheduled",
        },

        notes: {
          type: String,
          trim: true,
        },
      },
    ],

    offer: {
      salary: {
        type: Number,
        min: 0,
      },

      joiningDate: {
        type: Date,
      },

      notes: {
        type: String,
        trim: true,
      },
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Application", applicationSchema);