angular.module('ItemSetApp')
.controller('SearchController', ['$http', '$scope', function($http, $scope) {

		$scope.searchSummoner = function() {
			$scope.selectedChampions = [];
			$http.get('/api/matches/na/' + $scope.summoner).success(function(data) {
				$scope.champions = data.champions;
				$scope.data = data.data;
				$scope.prompt = "Which champions would you like to generate item sets for?";
			});
		};

		$scope.addChampion = function(name) {
			if($scope.selectedChampions) {
				var index = $scope.selectedChampions.indexOf(name);
				if(index > -1) {
					$scope.selectedChampions.splice(index, 1);
				} else {
					$scope.selectedChampions.push(name);
				}
			} else {
				$scope.selectedChampions = [name];
			}
		};

	}]);