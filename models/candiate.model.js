const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    party: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    votes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now(),
          required: true,
        },
      },
    ],
    voteCount: {
        type: Number,
        default: 0
    }
  },
  { timestamps: true }
);


const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;