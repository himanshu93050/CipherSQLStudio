const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  description: String,
  problemStatement: String,
  sampleData: [{ tableName: String, columns: [String], rows: [Object] }],
  hintPrompt: String, // Context to guide the LLM
});

module.exports = mongoose.model('Assignment', AssignmentSchema);