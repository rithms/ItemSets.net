angular.module('ItemSetApp').config(['$routeProvider', function($routeProvider) {

  $routeProvider
    .when('/', {
      redirectTo: '/featured_sets'
    })
    
    .when('/featured_sets', {
      templateUrl: 'templates/featured_games/index.html',
      controller: 'FeaturedGamesController'
    })

    .when('/how_to', {
      templateUrl: 'templates/item_set/how_to.html',
    })

        .when('/about', {
      templateUrl: 'templates/item_set/about.html',
    })

    .when('/champion_keys', {
      templateUrl: 'templates/item_set/champion_keys.html',
      controller: 'ChampionKeysController'
    })

    .when('/item_set/:id', {
      templateUrl: 'templates/item_set/index.html',
      controller: 'ItemSetController'
    })

    .otherwise({redirectTo: '/'});
}]);