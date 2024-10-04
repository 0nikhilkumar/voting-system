const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
    },
    address: {
        type: String,
        required: true,
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter',
    },
    isVoted: {
        type: Boolean,
        default: false,
    }
  },
  { timestamps: true });


  
  userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
  });
  
  userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  }
  
  
const User = mongoose.model("User", userSchema);
module.exports = User;