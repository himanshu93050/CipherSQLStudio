const mongoose = require('mongoose');
const path = require('path');
const Assignment = require(path.join(__dirname, '..', 'models', 'Assignment'));
const sampleData = require(path.join(__dirname, 'sampleData'));
require('dotenv').config();

const data = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Assignment.deleteMany({}); // Clears old data
    await Assignment.insertMany(sampleData);
    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

data();