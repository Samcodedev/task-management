const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    groupName: { type: String, required: true, unique: true },
    description: { type: String },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["admin", "manager", "member"], default: "member", require: true },
      },
    ],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("Group", groupSchema);
  