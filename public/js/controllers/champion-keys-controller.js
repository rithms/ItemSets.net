angular.module('ItemSetApp')
.controller('ChampionKeysController', ['$scope', 'StaticData', function($scope, StaticData) {

		// Static Data
		$scope.champions = StaticData.getChampions().success(function(data) {
				for(var i = 0; i < data.length; i++) {
					$scope.champions[data[i].id] = data[i];
				}
			});

	}]);