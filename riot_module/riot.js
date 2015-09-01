var request = require('request');

var protocol = "https://";
var	baseUrl = ".api.pvp.net/api/lol/";
var featureGameUrl = ".api.pvp.net/observer-mode/rest/featured";
var	summonerEndpoint = "/v1.4/summoner/by-name/";
var	matchListEndpoint = "/v2.2/matchlist/by-summoner/";
var staticDataChampionEndpoint = "static-data/na/v1.2/champion";
var staticDataItemEndpoint = "static-data/na/v1.2/item";
var staticDataSpellEndpoint = "static-data/na/v1.2/summoner-spell";
var	matchEndpoint = "/v2.2/match/";

var	key = "API-KEY-HERE";

var	retryAfter = 0;
var	summonerRetryAfter = 0;
var	matchlistRetryAfter = 0;
var matchRetryAfter = 0;
var staticDataRetryAfter = 0;
var featuredGameRetryAfter = 0;

module.exports = {

	// Get summoner by name
	getSummonerByName: function(region, name, callback) {
			var url = protocol + region + baseUrl + region + summonerEndpoint + name + '?api_key=' + key;
			checkLimit(url, "SUMMONER", callback);
	},

	// Get match list
	getMatchList: function(region, id, callback) {
			var url = protocol + region + baseUrl + region + matchListEndpoint + id.toString() + '?api_key=' + key;
			checkLimit(url, "MATCH_LIST", callback);
	}, 

	// Get match by id
	getMatch: function(region, id, callback) {
			var url = protocol + region + baseUrl + region + matchEndpoint + id.toString() + '?includeTimeline=true&api_key=' + key;
			checkLimit(url, "MATCH", callback);
	},

	// Get champion static data
	getChampionData: function(callback) {
			var url = protocol + 'global' + baseUrl + staticDataChampionEndpoint + '?champData=image&api_key=' + key;
			checkLimit(url, "STATIC_DATA", callback);
	},

	// Get item static data
	getItemData: function(callback) {
			var url = protocol + 'global' + baseUrl + staticDataItemEndpoint + '?itemListData=all&api_key=' + key;
			checkLimit(url, "STATIC_DATA", callback);
	},

	// Get spell static data
	getSpellData: function(callback) {
			var url = protocol + 'global' + baseUrl + staticDataSpellEndpoint + '?spellData=image&api_key=' + key;
			checkLimit(url, "STATIC_DATA", callback);
	},

	// Get featured game data
	getFeaturedGameData: function(region, callback) {
			var url = protocol + region + featureGameUrl + '?api_key=' + key;
			checkLimit(url, "FEATURED_GAMES", callback);
	}

};

// Ask Rito for data
function ritoPls(url, endpoint, callback) {
	request.get(url, function(err, response, body) {
		if(err) {
			console.log("Error: " + err);
			callback(123, {'status_code': 123, 'message': 'Request Error'});
		}
		else if(response.statusCode === 200) {
			callback(response.statusCode, JSON.parse(body));
		}
		else if(response.statusCode === 429) {
			if(response.headers['retry-after'] && response.headers['x-rate-limit-type']) {
				if(response.headers['x-rate-limit-type'] === 'user') {
					setUserLimit(parseInt(response.headers['retry-after'], 10));
				} else if (response.headers['x-rate-limit-type'] === 'service') {
					setServiceLimit(parseInt(response.headers['retry-after'], 10), endpoint);
				}
			} else {
				setUserLimit(10); // Underlying service rate limit, back off homie (10 seconds).
			}
			callback(response.statusCode, {'status_code': response.statusCode, 'message': 'Rate Limit Exceeded'});
		}
		else {
			callback(response.statusCode, {'status_code': response.statusCode, 'message': 'Something went wrong.'});
		}
	});
}

// Checks all rate limits before making another request
function checkLimit(url, endpoint, callback) {
	if(checkUserLimit() && checkServiceLimit(endpoint)) {
		ritoPls(url, endpoint, callback);
	} else {
		callback(429, {'status_code': 429, 'message': 'Please wait to make another request'});
	}
}

// Check if 'retry-after' time for user-based rate limit has passed
function checkUserLimit() {
	return retryAfter < Math.round(+new Date()/1000);
}

// Check if 'retry-after' time for service-based rate limit has passed
function checkServiceLimit(endpoint){
	var time = Math.round(+new Date()/1000);
	var check = false;
	switch(endpoint) {
		case "SUMMONER":
			check = summonerRetryAfter < time;
			break;
		case "MATCH_LIST":
			check = matchlistRetryAfter < time;
			break;
		case "MATCH":
			check = matchRetryAfter < time;
			break;
		case "STATIC_DATA":
			check = staticDataRetryAfter < time;
			break;
		case "FEATURED_GAMES":
			check = featuredGameRetryAfter < time;
			break;

	} return check;
}

// Set service-based rate limit of specified endpoint
function setServiceLimit(limit, endpoint) {
	var time = Math.round(+new Date()/1000) + 1 + limit;
	switch(endpoint) {
		case "SUMMONER":
			summonerRetryAfter = time;
			break;
		case "MATCH_LIST":
			matchlistRetryAfter = time;
			break;
		case "MATCH":
			matchRetryAfter = time;
			break;
		case "STATIC_DATA":
			staticDataRetryAfter = time;
			break;
		case "FEATURED_GAMES":
			featuredGameRetryAfter = time;
			break;
	}
}

// Set user-based rate limit
function setUserLimit(limit) {
	retryAfter = Math.round(+new Date()/1000) + 1 + limit;
}