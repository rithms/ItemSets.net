var http = require('http');
var express = require('express');
var app = express();
var morgan = require('morgan');
var api = require('./routes/api');
var riot = require('./riot_module/riot.js');
var mongoose = require('mongoose');
var staticData = require('./modules/static-data.js');
var generator = require('./modules/generator.js');

var Match = require('./models/match.js');
var ItemSet = require('./models/set.js');

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use('/api', api);

mongoose.connect('mongodb://localhost/mongo', function(err) {
    if(err) {
        console.log('DB Connection Error.', err);
    } else {
        console.log('DB Connection Successful.');
    }
});

//ItemSet.remove({}, function(){});

// application ----------------------------------------------
app.get('/', function(req, res) {
	res.sendFile('public/index.html', {'root' : __dirname});
});

app.get('/set', function(req, res) {
	res.sendFile('public/set.html', {'root' : __dirname});
});

app.listen(3000, function() {
	console.log('Server running at http://127.0.0.1:3000/');
});

// Update static data on server start, update daily afterwards.
staticData.updateChampionData();
staticData.updateItemData();
staticData.updateSpellData();
setInterval(function() {
	staticData.updateChampionData();
	staticData.updateItemData();
	staticData.updateSpellData();
}, 86400 * 1000);


// Get featured game data
setInterval(function() {
	generator.getFeaturedGames("na");
}, 60000);

// Generate sets from featured game data (when they end)
setInterval(function() {
	generator.generateSets();
}, 30000);

// Print match count to console every 30 seconds
setInterval(function() {
	Match.count({}, function(err, count) {
		if(err) console.log(err);
		console.log("Match Count: " + count);
		});
}, 30000);

// Print item set count to console every 30 seconds
setInterval(function() {
	ItemSet.count({}, function(err, count) {
		if(err) console.log(err);
		console.log("Analyzed Matches: " + count / 10);
		console.log("Item Set Count: " + count);
		console.log("--------------------");
		});
}, 30000);

// Clear-out old featured item sets every 12 hours (keeps item sets created within last 3 hours)
setInterval(function() {
	ItemSet.find({
    updated_at : { $lte : new Date(ISODate().getTime() - 1000 * 60 * 60 * 3) } }).remove({}).exec();
}, 12 * 60 * 60000);