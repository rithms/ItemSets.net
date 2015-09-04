angular.module('ItemSetApp')
.controller('FeaturedGamesController', ['$http', '$scope', 'StaticData', function($http, $scope, StaticData) {
		
		$scope.index = 0;
		$scope.hasMoreData = true;
		$scope.loading = true;
		$scope.queue = 'RANKED_SOLO_5x5';
		$scope.tier = 'CHALLENGER';

		$http.get('/api/featured_sets/queue/' + $scope.queue + '/tier/' + $scope.tier + '/' + $scope.index).success(function(data) {
				$scope.sets = data;
				$scope.index += 30;
				$scope.loading = false;
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

		$scope.getMoreMatches = function() {
			var endpoint = "";
			//If filtering by champion, use by-champion endpoint
			if(parseInt($scope.championId) > 0) {
				endpoint = '/api/featured_sets/queue/' + $scope.queue + '/tier/' + $scope.tier + '/by-champion/' + $scope.championId + '/' + $scope.index;
				if($scope.tier === 'ALL') {
					endpoint = '/api/featured_sets/queue/' + $scope.queue + '/by-champion/'+ $scope.championId + '/' + $scope.index;
				}
			} else {
				endpoint = '/api/featured_sets/queue/' + $scope.queue + '/tier/' + $scope.tier + '/' + $scope.index;
				if($scope.tier === 'ALL') {
					endpoint = '/api/featured_sets/queue/' + $scope.queue + '/' + $scope.index;
				}
			}

			$http.get(endpoint).success(function(data) {
				if(data.length > 0) {
					$scope.sets = $scope.sets.concat(data);
					$scope.index += 30;
				} else {
					$scope.hasMoreData = false;
				} $scope.loading = false;
			});
		};

		$scope.getMatchesByChampion = function(championId) {
			if($scope.championId !== championId) {
				$scope.resetData();
			}
			$scope.championId = championId;
			$scope.getMoreMatches();
		};

		$scope.setQueue = function(queue) {
			$scope.queue = queue;
			$scope.loadData();
		};

		$scope.setTier = function(tier) {
			$scope.tier = tier;
			$scope.loadData();
		};

		$scope.loadData = function() {
			$scope.resetData();
			$scope.getMoreMatches();
		};

		$scope.resetData = function() {
			$scope.index = 0;
			$scope.hasMoreData = true;
			$scope.sets = [];
			$scope.loading = true;
			$scope.championTab = false;
			$scope.otherTab = false;
		};

	}]);