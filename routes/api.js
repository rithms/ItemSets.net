var express = require('express');
var router = express.Router();
var riot = require('../riot_module/riot.js');
var staticData = require('../modules/static-data.js');
var Champion = require('../models/champion.js');
var Item = require('../models/item.js');
var Spell = require('../models/spell.js');
var ItemSet = require('../models/set.js');

router.route('/matches/:region/:name')
	.get(function(req, res) {
		riot.getSummonerByName(req.params.region, req.params.name, function(status_code, data) {
			if(status_code === 200) {
				var json  = {};
				var name = req.params.name.toLowerCase().replace(/ /g,'');
				getSummonerData(json, data[name]);
				riot.getMatchList(req.params.region, data[name]['id'], function(status_code, data) {
					if(status_code === 200) {
						if(getMatchData(json, data)) {
							getChampionDataFromMatches(json, function(champions) {
								json.champions = champions;
								res.send(json);

							});
							// Cache match data
						} else {
							res.json({'message' : 'No matches found'}); // no matches found for summoner
						}
						
					}
				});
			} else {
				// do something else
			}
		});
	});


// Static Data Endpoints --------------------------

// Champions Endpoint - returns stored champion data.
router.route('/champions')
	.get(function(req, res) {
		Champion.find({}, function(err, champions) {
			if(err) console.log(err);
			if(champions) {
				res.json(champions);
			}
		});
	});

// Items Endpoint - returns stored item data.
router.route('/items')
	.get(function(req, res) {
		Item.find({}, function(err, items) {
			if(err) console.log(err);
			if(items) {
				res.json(items);
			}
		});
	});

// Spells Endpoint - returns stored spell data.
router.route('/spells')
	.get(function(req, res) {
		Spell.find({}, function(err, spells) {
			if(err) console.log(err);
			if(spells) {
				res.json(spells);
			}
		});
	});


// Featured Set Endpoints --------------------------

// Get featured sets for the given queue and tier (limit 30)
router.route('/featured_sets/queue/:queueType/tier/:tier/by-champion/:championId')
	.get(function(req, res) {
		ItemSet.find({'queueType': req.params.queueType, 'tier': req.params.tier, 'championId': parseInt(req.params.championId)}).sort({date: -1}).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});

// Get featured sets for the given queue and tier, specifying a begin index for pagination (limit 30)
router.route('/featured_sets/queue/:queueType/tier/:tier/by-champion/:championId/:beginIndex')
	.get(function(req, res) {
		ItemSet.find({'queueType': req.params.queueType, 'tier': req.params.tier, 'championId': parseInt(req.params.championId)}).sort({date: -1}).skip(parseInt(req.params.beginIndex)).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});

// Get featured sets for the given queue and tier, specifying a begin index for pagination (limit 30)
router.route('/featured_sets/queue/:queueType/by-champion/:championId/:beginIndex')
	.get(function(req, res) {
		ItemSet.find({'queueType': req.params.queueType, 'championId': parseInt(req.params.championId)}).sort({date: -1}).skip(parseInt(req.params.beginIndex)).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});

// Get featured sets for the given queue and tier (limit 30)
router.route('/featured_sets/queue/:queueType/tier/:tier')
	.get(function(req, res) {
		ItemSet.find({'queueType': req.params.queueType, 'tier': req.params.tier}).sort({date: -1}).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});

// Get featured sets for the given queue and tier, specifying a begin index for pagination (limit 30)
router.route('/featured_sets/queue/:queueType/tier/:tier/:beginIndex')
	.get(function(req, res) {
		ItemSet.find({'queueType': req.params.queueType, 'tier': req.params.tier}).sort({date: -1}).skip(parseInt(req.params.beginIndex)).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});


// Get featured sets for the given queue (limit 30)
router.route('/featured_sets/queue/:queueType')
	.get(function(req, res) {
		ItemSet.find({'queueType': req.params.queueType}).sort({date: -1}).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});

// Get featured sets for the given queue, specifying a begin index for pagination (limit 30)
router.route('/featured_sets/queue/:queueType/:beginIndex')
	.get(function(req, res) {
		ItemSet.find({'queueType': req.params.queueType}).sort({date: -1}).skip(parseInt(req.params.beginIndex)).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});

// Get all featured sets (limit 30)
router.route('/featured_sets')
	.get(function(req, res) {
		ItemSet.find({}).sort({date: -1}).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});

// Get all featured sets, specifying a begin index for pagination (limit 30)
router.route('/featured_sets/:beginIndex')
	.get(function(req, res) {
		ItemSet.find({}).sort({date: -1}).skip(parseInt(req.params.beginIndex)).limit(30).exec(function(err, sets) {
			if(err) console.log(err);
			if(sets) {
				res.json(sets);
			}
		});
	});

// Get item set by id
router.route('/item_set/:id')
	.get(function(req, res) {
		ItemSet.findOne({'_id': req.params.id}).exec(function(err, set) {
			if(err) console.log(err);
			if(set) {
				res.json(set);
			}
		});
	});

function getChampionDataFromMatches(json, callback) {
	var championIds = [];
	for(var key in json.matches) {
		if (!json.matches.hasOwnProperty(key)) {
			continue;
		}
		championIds.push(key);
	}
	Champion.find({'id': {$in: championIds}}, function(err, champions) {
			if(err) console.log(err);
			if(champions) {
				callback(champions);
			}
		});
}

// Gets relevant match data from data, and adds it to json.
function getMatchData(json, data) {
	if(data.totalGames <= 0) {
		return false;
	}
	var matches = data.matches;
	json.matches = {};
	for(var i=0; i < matches.length; i++) {
		var championId = matches[i].champion;
		if(json.matches[championId]) {
			json.matches[championId].push(matches[i].matchId);
		} else {
			json.matches[championId] = [matches[i].matchId];
		}
	}
	return true;
}

// Gets relevant summoner data from data, and adds it to json.
function getSummonerData(json, data) {
	json.name = data.name;
	json.id = data.id;
	json.icon = data.profileIconId;
}

// Gets item data for a specified champion
// (assumes ranked queues only, thus no mirror matchups)
function getItemData(championId, json) {
	var participants = json.participants;
	var items = [];
	for(var i=0; i < participants.length; i++) {
		if(championId === participants[i].championId) {
			if(participants[i].stats.item0 !== 0) {
				items.push(participants[i].stats.item0);
			}
			if(participants[i].stats.item1 !== 0) {
				items.push(participants[i].stats.item1);
			}
			if(participants[i].stats.item2 !== 0) {
				items.push(participants[i].stats.item2);
			}
			if(participants[i].stats.item3 !== 0) {
				items.push(participants[i].stats.item3);
			}
			if(participants[i].stats.item4 !== 0) {
				items.push(participants[i].stats.item4);
			}
			if(participants[i].stats.item5 !== 0) {
				items.push(participants[i].stats.item5);
			}
			if(participants[i].stats.item6 !== 0) {
				items.push(participants[i].stats.item6);
			}
			return items;
		}
	}
}	

module.exports = router;