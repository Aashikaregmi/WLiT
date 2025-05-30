const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter the username"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    stats: {
      caught: {
        type: Number,
        default: 0,
      },
      missed: {
        type: Number,
        default: 0,
      },
      cancelled: {
        type: Number,
        default: 0,
      },
    },
    buses: [
      {
        bus: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Bus',
          required: true,
        },
        status: {
          type: String,
          enum: ['caught', 'missed', 'cancelled'],
          default: 'caught',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;


