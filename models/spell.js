var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SpellSchema = new Schema({
  name: String,
  id: Number,
  key: String,
  image: String,
  version: String,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Spell', SpellSchema);