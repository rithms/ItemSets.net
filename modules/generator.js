var riot = require('../riot_module/riot.js');
var mongoose = require('mongoose');
var Match = require('../models/match.js');
var ItemSet = require('../models/set.js');
var Item = require('../models/item.js');

module.exports = {

	getFeaturedGames: function(region) {
		riot.getFeaturedGameData(region, function(status_code, data) {
			if(status_code === 200) {
				var gameList = data.gameList;
				for(var i = 0; i < gameList.length; i++) {
					Match.update({id: gameList[i].gameId}, {
						id: gameList[i].gameId,
				    	mapId: gameList[i].mapId, 
			    		queueId: gameList[i].gameQueueConfigId, 
			    		mode: gameList[i].gameMode, 
			    		type: gameList[i].gameType,
			    		region: region,
			    		date: Date.now()
			    	}, 
			    	{ upsert: true }, function(){});
				}
			} else {
				console.log("Something went wrong yo. Status Code: " + status_code.toString());// something went wrong
			}
		});
	},

	generateSets: function() {
		Match.findOne({}).sort({date: 1}).exec(function(err, match) {
			if(err) console.log(err);
			if(match) {
				riot.getMatch(match.region, match.id, function(status_code, data) {
					if(status_code === 200 && data.timeline) {
						var matchData = analyzeMatch(data);
						saveSets(matchData);
						Match.remove({id: match.id}, function(){});
					} else if(status_code === 200) {
							console.log("--------------------");
							console.log("Timeline data not found. Match ID: " + data.matchId);
							console.log("--------------------");
							Match.update({id: match.id}, {date: Date.now()}, function(){});
					} else if(status_code === 404){
						Match.remove({id: match.id}, function(){});
					} else {
						console.log("Something went wrong: " + status_code.toString());
					}
				});
			}
		});
	}

};

function addBlock(set, block) {
	set.blocks.push(block);
}

function addItem(block, item) {
	block.items.push(item);
}

function addItems(block, items) {
	for(var i = 0; i < items.length; i++) {
		block.items.push(items[i]);
	}
}

function createItem(id, count) {
	if(count < 0 || count > 99) {
		count = 1;
	} return {"id": id.toString(), "count": count};
}

function createItems(itemIds) {
	var trinketIds = [3361, 3362, 3363, 3364, 3340, 3341, 3342, 3345];
	var items = [];
	for(var key in itemIds) {
		if(key !== 0) {
			if(trinketIds.indexOf(parseInt(key)) > -1) {
				items.push(createItem(key, 1));
			} else {
				items.push(createItem(key, itemIds[key]));
			}
		}
	}
	return items;
}

function createBlock(type) {
	return {
	    "type": type,
	    "recMath": false,
	    "minSummonerLevel": -1,
	    "maxSummonerLevel": -1,
	    "showIfSummonerSpell": "",
	    "hideIfSummonerSpell": "",
	    "items": []
    };
}

function createSet(title) {
	return {
		"title": title,
	    "type": "custom",
	    "map": "any",
	    "mode": "any",
	    "priority": false,
	    "sortrank": 0,
	    "blocks": []
	};
}

// ----------------------------------------------------

function analyzeMatch(matchData) {
	data = {};
	summonerInfo = {};
	for(var i = 0; i < matchData.participantIdentities.length; i++) {
		if(!matchData.participantIdentities[i].player) {
			summonerInfo[matchData.participantIdentities[i].participantId] = {name: "Unknown", icon: 0, summonerId: 0};
		} else {
			summonerInfo[matchData.participantIdentities[i].participantId] = {name: matchData.participantIdentities[i].player.summonerName, icon: matchData.participantIdentities[i].player.profileIcon, summonerId: matchData.participantIdentities[i].player.summonerId};
		}
	}

	for(var i = 0; i < matchData.participants.length; i++) {
		var participantId = matchData.participants[i].participantId;
		data[participantId] = {}
		data[participantId].name = summonerInfo[matchData.participants[i].participantId].name;
		data[participantId].summonerId = summonerInfo[matchData.participants[i].participantId].summonerId;
		data[participantId].icon = summonerInfo[matchData.participants[i].participantId].icon;
		data[participantId].championId = matchData.participants[i].championId;
		data[participantId].winner = matchData.participants[i].stats.winner;
		data[participantId].kills = matchData.participants[i].stats.kills;
		data[participantId].item0 = matchData.participants[i].stats.item0;
		data[participantId].item1 = matchData.participants[i].stats.item1;
		data[participantId].item2 = matchData.participants[i].stats.item2;
		data[participantId].item3 = matchData.participants[i].stats.item3;
		data[participantId].item4 = matchData.participants[i].stats.item4;
		data[participantId].item5 = matchData.participants[i].stats.item5;
		data[participantId].item6 = matchData.participants[i].stats.item6;
		data[participantId].deaths = matchData.participants[i].stats.deaths;
		data[participantId].assists = matchData.participants[i].stats.assists;
		data[participantId].spell1 = matchData.participants[i].spell1Id;
		data[participantId].spell2 = matchData.participants[i].spell2Id;
		data[participantId].tier = matchData.participants[i].highestAchievedSeasonTier;
		data[participantId].role = matchData.participants[i].timeline.role;
		data[participantId].lane = matchData.participants[i].timeline.lane;
		data[participantId].matchId = matchData.matchId;
		data[participantId].minions = matchData.participants[i].stats.minionsKilled + matchData.participants[i].stats.neutralMinionsKilled;
		data[participantId].gold = matchData.participants[i].stats.goldEarned;
		data[participantId].matchMode = matchData.matchMode;
		data[participantId].queueType = matchData.queueType;
		data[participantId].season = matchData.season;
		data[participantId].build = {};
		data[participantId].afk = true;
		data[participantId].starting = {};
		data[participantId].startInit = false;
	}

	processEventData(data, matchData);

	return data;
}

function processEventData(data, matchData) {
	var timelineFrames = matchData.timeline.frames;
	for(var i = 0; i < timelineFrames.length; i++) {
		if(timelineFrames[i].events) {
			for(var j = 0; j < timelineFrames[i].events.length; j++) {
				var frameEvent = timelineFrames[i].events[j];
				processItemEvent(data, frameEvent);
			}
		}

		for(var key in data) {
			if(!data[key].afk && !data[key].startInit) {
				for(var item in data[key].build) {
					data[key].starting[item] = data[key].build[item];
				}
				data[key].startInit = true;
			}
		} // check for starting build
	}
}

function processItemEvent(data, frameEvent) {
	var participantId = frameEvent.participantId;
	if(participantId > 0) {
		switch(frameEvent.eventType) {
			case "ITEM_DESTROYED":
			case "ITEM_SOLD":
				if(data[participantId].build.hasOwnProperty(frameEvent.itemId)) {
					if(data[participantId].build[frameEvent.itemId] > 1) {
						data[participantId].build[frameEvent.itemId]--;
					} else {
						delete data[participantId].build[frameEvent.itemId];
					}
				}

				break;
			case "ITEM_PURCHASED":
				if(data[participantId].build.hasOwnProperty(frameEvent.itemId)) {
					data[participantId].build[frameEvent.itemId]++;
				} else {
					data[participantId].build[frameEvent.itemId] = 1;
				}
				data[participantId].afk = false;
				break;
			case "ITEM_UNDO":
				if(frameEvent.itemBefore !== 0) {
					if(data[participantId].build.hasOwnProperty(frameEvent.itemBefore)) {
						if(data[participantId].build[frameEvent.itemBefore] > 1) {
							data[participantId].build[frameEvent.itemBefore]--;
						} else {
							delete data[participantId].build[frameEvent.itemBefore];
						}
					}
				}
				if(frameEvent.itemAfter !== 0) {
					if(data[participantId].build.hasOwnProperty(frameEvent.itemAfter)) {
						data[participantId].build[frameEvent.itemAfter]++;
					} else {
						data[participantId].build[frameEvent.itemAfter] = 1;
					}
				}

				break;
		}
	}
}

function createSetForPlayer(playerData) {
	var itemSet = createSet(playerData.name + " (" + playerData.matchId.toString() + ")");
	
	var startingItemsBlock = createBlock("Starting Items");
	var startingItems = createItems(playerData.starting);
	addItems(startingItemsBlock, startingItems);
	addBlock(itemSet, startingItemsBlock);

	var finalBuildBlock = createBlock("Final Build");
	var finalBuildItems = createItems(playerData.build);
	addItems(finalBuildBlock, finalBuildItems);
	addBlock(itemSet, finalBuildBlock);

	return itemSet;
}

function printSets(data) {
	for(var key in data) {
		console.log(data[key].name + ": ");
		var set = createSetForPlayer(data[key]);
		console.log(JSON.stringify(set, null, 4));
	}
}

function saveSets(data) {
	console.log("Saving Sets");
	console.log("--------------------");
	for(var key in data) {
		var set = createSetForPlayer(data[key]);
		ItemSet.update({summonerId: data[key].summonerId, item_set: set}, 
			{	
				name: data[key].name,
				summonerId: data[key].summonerId,
				championId: data[key].championId,
				icon: data[key].icon,
				tier: data[key].tier,
				winner: data[key].winner,
				kills: data[key].kills,
				deaths: data[key].deaths,
				assists: data[key].assists,
				spell1: data[key].spell1,
				spell2: data[key].spell2,
				tier: data[key].tier,
				role: data[key].role,
				lane: data[key].lane,
				matchId: data[key].matchId,
				item0: data[key].item0,
				item1: data[key].item1,
				item2: data[key].item2,
				item3: data[key].item3,
				item4: data[key].item4,
				item5: data[key].item5,
				item6: data[key].item6,
				matchMode: data[key].matchMode,
				queueType: data[key].queueType,
				season: data[key].season,
				gold: data[key].gold,
				minions: data[key].minions,
				item_set: set,
				date: Date.now()
			}, 
    	{ upsert: true }, function(){});
	}
}