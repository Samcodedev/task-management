const mongoose = require("mongoose");

// Remove the OTP fields from the main schema and handle them separately
const UserSchema = new mongoose.Schema({
    
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  UserName: {type: String, unique: true, required: true},
  email: { type: String, unique: true, required: true },
  phoneNumber: {type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },

  
  role: { type: String, enum: ["admin", "manager", "employee"], default: "employee" }, 
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }], 
  tasksAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

  createdAt: { type: Date, default: Date.now }
});

// Create a separate OTP schema
const OTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 // OTP document will be automatically deleted after 60 seconds of user not verified
  }
});

// Add methods to handle OTP
UserSchema.methods.generateOTP = async function() {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Create or update OTP document
  await mongoose.model('OTP').findOneAndUpdate(
    { userId: this._id },
    { 
      userId: this._id,
      otp: otp
    },
    { upsert: true, new: true }
  );
  
  return otp;
};

UserSchema.methods.verifyOTP = async function(otpToVerify) {
  const otpDoc = await mongoose.model('OTP').findOne({ 
    userId: this._id,
    otp: otpToVerify
  });

  if (!otpDoc) {
    return false;
  }

  // If OTP matches, verify the user and delete the OTP
  await Promise.all([
    mongoose.model('User').findByIdAndUpdate(
      this._id,
      { isVerified: true }
    ),
    mongoose.model('OTP').deleteOne({ _id: otpDoc._id })
  ]);

  return true;
};

const User = mongoose.model("User", UserSchema);
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = { User, OTP };
