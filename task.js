const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  deadline: { type: Date },
  priority: { type: String, required: true, enum: ["low", "medium", "high"] },
});

module.exports = mongoose.model("Task", taskSchema);
