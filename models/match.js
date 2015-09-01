var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MatchSchema = new Schema({
  id: Number,
  mapId: Number,
  queueId: Number,
  mode: String,
  type: String,
  region: String,
  date: Date,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Match', MatchSchema);