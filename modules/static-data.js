var riot = require('../riot_module/riot.js');
var mongoose = require('mongoose');
var Champion = require('../models/champion.js');
var Item = require('../models/item.js');
var Spell = require('../models/spell.js');

module.exports = {

	updateChampionData: function() {
		riot.getChampionData(function(status_code, data){
			if(status_code === 200) {
				var version = data.version;
				var champions = data.data;
				for(var champion in champions) {
				    if (!champions.hasOwnProperty(champion)) {
				        continue;
				    }
				    Champion.update({id: champions[champion].id}, {
				    	name: champions[champion].name, 
			    		id: champions[champion].id, 
			    		title: champions[champion].title, 
			    		key: champions[champion].key, 
			    		image: champions[champion].image.full, 
			    		version: version
			    	}, 
			    	{ upsert: true }, function(){});
				}
				console.log("Champion data updated.");
			} else {
				// something went wrong
			}
		});
	},

	updateItemData: function() {
		riot.getItemData(function(status_code, data){
			if(status_code === 200) {
				var version = data.version;
				var items = data.data;
				for(var item in items) {
				    if (!items.hasOwnProperty(item)) {
				        continue;
				    }
				    Item.update({id: items[item].id}, {
				    	name: items[item].name, 
				    	id: items[item].id, 
				    	group: items[item].group, 
				    	image: items[item].image.full, 
				    	tags: items[item].tags,
				    	into: items[item].into,
				    	from: items[item].from,
				    	version: version
				    }, 
				    { upsert: true }, function(){});
				}
				console.log("Item data updated.");
			} else {
				// something went wrong
			}
		});
	},

	updateSpellData: function() {
		riot.getSpellData(function(status_code, data){
			if(status_code === 200) {
				var version = data.version;
				var spells = data.data;
				for(var spell in spells) {
				    if (!spells.hasOwnProperty(spell)) {
				        continue;
				    }
				    Spell.update({id: spells[spell].id}, {
				    	name: spells[spell].name, 
				    	id: spells[spell].id, 
				    	key: spells[spell].key, 
				    	image: spells[spell].image.full, 
				    	version: version
				    }, 
				    { upsert: true }, function(){});
				}
				console.log("Spell data updated.");
			} else {
				// something went wrong
			}
		});
	}

};