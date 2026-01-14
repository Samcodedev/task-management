const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    tasksList: [{ type: String }],
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    supervisor: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true }, 
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "on-hold"],
      default: "pending",
    },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("Task", taskSchema);
