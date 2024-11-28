const express = require('express');

const mongoose = require('mongoose');

const app = express();

//Create a schema
const loginSchema = new mongoose.Schema({
  name: {
    type: String, // Use `String` (uppercase).
    required: true
  },
  password: {
    type: String, // Use `String` (uppercase).
    required: true
  }
});
//collection part
const collection = new mongoose.model("user", loginSchema);

module.exports = collection;

// Export the schema as a model (optional, for future use)
const Login = mongoose.model('Login', loginSchema);

module.exports = Login; // Export the model
const dbURL = 'mongodb+srv://capstone_01:finance12@cluster0.bqzll.mongodb.net/';

mongoose
  .connect(dbURL)
  .then((result) => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server started on port 5000');
    });
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err);
  });

