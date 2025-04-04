
# Models Directory

This directory contains Mongoose models for MongoDB collections.

Example model structure:
```javascript
const mongoose = require('mongoose');

const ExampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Example', ExampleSchema);
```
