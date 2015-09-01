angular.module('ItemSetApp')
.controller('ItemSetController', ['$http', '$scope', '$routeParams', 'StaticData', function($http, $scope, $routeParams, StaticData) {
	
	$scope.offense_tags = [ "SPELLDAMAGE", "COOLDOWNREDUCTION", "DAMAGE", "CRITICALSTRIKE", "ATTACKSPEED", "LIFESTEAL"];
	$scope.defense_tags = ["HEALTH", "ARMOR", "SPELLBLOCK"];
	$scope.consumable_tags = ["CONSUMABLE", "VISION"];

	$scope.items = StaticData.getItems().success(function(data) {
		for(var i = 0; i < data.length; i++) {
			$scope.items[data[i].id] = data[i];
		}
	});

	$scope.champions = StaticData.getChampions().success(function(data) {
		for(var i = 0; i < data.length; i++) {
			$scope.champions[data[i].id] = data[i];
		}
	});

	$scope.editMode = false;

	// Get item set from API
	$http.get('/api/item_set/' + $routeParams.id).success(function(data) {
		$scope.sanitizeSet(data);
		$scope.updateName(data);
		data.consumables = [];
		data.offense = [];
		data.defense = [];
		$scope.analyzeTags(data);
		$scope.addAdditionalBlocks(data);
		$scope.set = data;
	});

	// Static Data
	$scope.champions = StaticData.getChampions().success(function(data) {
		for(var i = 0; i < data.length; i++) {
			$scope.champions[data[i].id] = data[i];
		}
	});
	$scope.items = StaticData.getItems().success(function(data) {
			for(var i = 0; i < data.length; i++) {
				$scope.items[data[i].id] = data[i];
			}
			$scope.items[0] = {
				id: 0,
				name: "No Item",
				image: "0.png",
				};
		});
	$scope.spells = StaticData.getSpells().success(function(data) {
			for(var i = 0; i < data.length; i++) {
				$scope.spells[data[i].id] = data[i];
			}
		});

	$scope.updateName = function(data) {
		data.item_set.title = data.name + "'s " + $scope.champions[data.championId].name + " (" + data.matchId + ")";
	};

	$scope.sanitizeSet = function(data) {
		delete data.item_set._id;
		if(data.item_set.blocks.length > 0) {
			for(var i = 0; i < data.item_set.blocks.length; i++) {
				delete data.item_set.blocks[i]._id;
				if(data.item_set.blocks[i].items.length > 0) {
					for(var j = 0; j < data.item_set.blocks[i].items.length; j++) {
						delete data.item_set.blocks[i].items[j]._id;
					}
				}
			}
		}
	};

	// Don't do this at home kids.
	$scope.analyzeTags = function(data) {
		if(data.item_set.blocks.length > 0) {
			for(var i = 0; i < data.item_set.blocks.length; i++) {
				if(data.item_set.blocks[i].items.length > 0) {
					for(var j = 0; j < data.item_set.blocks[i].items.length; j++) {
						var item_id = data.item_set.blocks[i].items[j].id;

						if(data.item_set.blocks[i].type === 'Starting Items') {
							for(var k = 0; k < $scope.items[item_id].tags.length; k++) {
								for(var l = 0; l < $scope.consumable_tags.length; l++) {
									if($scope.items[item_id].tags[k].toUpperCase() === $scope.consumable_tags[l]) {
										if(data.consumables.indexOf(item_id) === -1) {
											data.consumables.push(item_id);
										}
									}
								}
							}
						}

						if(data.item_set.blocks[i].type === 'Final Build') {
							for(var k = 0; k < $scope.items[item_id].tags.length; k++) {
								for(var l = 0; l < $scope.consumable_tags.length; l++) {
									if($scope.items[item_id].tags[k].toUpperCase() === $scope.consumable_tags[l]) {
										if(data.consumables.indexOf(item_id) === -1) {
											data.consumables.push(item_id);
										}
									}
								}

								for(var m = 0; m < $scope.offense_tags.length; m++) {
									if($scope.items[item_id].tags.indexOf('Lane') === -1 && 
										$scope.items[item_id].tags.indexOf('SpellBlock') === -1 &&
										$scope.items[item_id].tags.indexOf('Armor') === -1 &&
										$scope.items[item_id].tags[k].toUpperCase() === $scope.offense_tags[m] && 
										$scope.items[item_id].into.length === 0) {
										if(data.offense.indexOf(item_id) === -1) {
											data.offense.push(item_id);
										}
									}
								}

								for(var n = 0; n < $scope.defense_tags.length; n++) {
									if($scope.items[item_id].tags.indexOf('Lane') === -1 && 
										$scope.items[item_id].tags[k].toUpperCase() === $scope.defense_tags[n] && 
										$scope.items[item_id].into.length === 0) {
										if(data.defense.indexOf(item_id) === -1) {
											data.defense.push(item_id);
										}
									}
								}
							}
						}

					}
				}
			}
		}
	}

	$scope.createBlock = function(items, type) {
		var block = {
		    "type": type,
		    "recMath": false,
		    "minSummonerLevel": -1,
		    "maxSummonerLevel": -1,
		    "showIfSummonerSpell": "",
		    "hideIfSummonerSpell": "",
		    "items": []
	    };

	    for(var i = 0; i < items.length; i++) {
	    	var item = {"id" : items[i], "count" : 1};
	    	block.items.push(item);
	    }
	    return block;
	};

	$scope.addAdditionalBlocks = function(data) {
		if(data.offense.length > 0) {
			data.item_set.blocks.push($scope.createBlock(data.offense, "Offensive Items"));
		}
		if(data.defense.length > 0) {
			data.item_set.blocks.push($scope.createBlock(data.defense, "Defensive Items"));
		}

		if(data.queueType === 'RANKED_SOLO_5x5') {
			if(data.defense.indexOf('2044') === -1) {
				data.consumables.push('2044');
			}
			if(data.defense.indexOf('2043') === -1) {
				data.consumables.push('2043');
			}
		}
		if(data.consumables.length > 0) {
			data.item_set.blocks.push($scope.createBlock(data.consumables, "Consumables"));
		}
		delete data.offensive;
		delete data.defensive;
		delete data.consumable;
	}


	$scope.toggleEditMode = function() {
		$scope.editMode = !($scope.editMode);
	}

	}]);