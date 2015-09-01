var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
	id: String,
	count: {type: Number, default: 0}
});

var BlockSchema = new Schema({
    type: String,
    recMath: {type: Boolean, default: false},
    minSummonerLevel: {type: Number, default: -1},
    maxSummonerLevel: {type: Number, default: -1},
    showIfSummonerSpell: {type: String, default: ""},
    hideIfSummonerSpell: {type: String, default: ""},
    items: [ItemSchema]
});

var SetSchema = new Schema({
   	item_set: {
   		title: String,
	    type: {type: String, default: "custom"},
	    map: {type: String, default: "any"},
	    mode: {type: String, default: "any"},
	    priority: {type: Boolean, default: false},
	    sortrank: {type: Number, default: 0},
	    blocks: [BlockSchema]
	},
	name: { type: String, default: "Unknown" },
	championId: { type: Number, default: 0 },
	summonerId: { type: Number, default: 0 },
	icon: { type: Number, default: 0 },
	tier: { type: String, default: "UNRANKED" },
	winner: Boolean,
	kills: Number,
	deaths: Number,
	assists: Number,
	spell1: Number,
	spell2: Number,
	role: String,
	lane: String,
	matchId: Number,
	item0: { type: Number, default: 0 },
	item1: { type: Number, default: 0 },
	item2: { type: Number, default: 0 },
	item3: { type: Number, default: 0 },
	item4: { type: Number, default: 0 },
	item5: { type: Number, default: 0 },
	item6: { type: Number, default: 0 },
	matchMode: String,
	queueType: String,
	season: String,
	gold: { type: Number, default: 0 },
	minions: { type: Number, default: 0 },
	updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ItemSet', SetSchema);