// Backend/Model/AnimationJob.js
const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: 'queued' },
  progress: { type: Number, default: 0 },
  logs: { type: Array, default: [] },
  result: { type: Object, default: null },
  structured: { type: Object, default: null },
  scenes: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('AnimationJob', Schema);
