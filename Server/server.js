/*
*
* Authors: James Hall and Nicola Willis
* Team: NegasonicStudentWarhead
*
*/

var protocol = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var static = require('node-static');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var Twit = require('twit');
var mysql = require('mysql');
var config = require('./config.js');

var twitterClient = new Twit(config.twitter);
var mySqlConnection = mysql.createConnection(config.mysql);

var fileServer = new (static.Server)();
var portNo = config.portNo;

var app = express();
app.use(bodyParser.json());
app.use(cors());
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// }));

var server = app.listen(portNo);

/********** GET METHODS **********/
app.get('/getPlayers.html', function (request, response) {
	getFootballPlayers(response);
})

/********** POST METHODS **********/
app.post('/getAllTweets.html', function(request, response){
	getAllTweets(request.body, response);
});

app.post('/getAnyTweets.html', function(request, response){
	getAnyTweets(request.body, response);
});

function getAllTweets(clientData, response){
	var twitterQuery = '';
	var queryTeam = clientData.team;
	var queryPlayers = clientData.players;
	var queryHashtags = clientData.hashtags;
	var queryKeywords = clientData.keywords;

	twitterQuery = twitterQuery + ' from:' + queryTeam;
	if(queryPlayers !== undefined){
		queryPlayersCount = queryPlayers.length;
		for(i = 0; i < queryPlayersCount; i++){
			if(queryPlayers[i] != ""){
				twitterQuery = twitterQuery + ' from:' + queryPlayers[i];
			}
		}
	}

	if(queryHashtags !== undefined){
		queryHashtagsCount = queryHashtags.length;
		for(i = 0; i < queryHashtagsCount; i++){
			if(queryHashtags[i] != ""){
				twitterQuery = twitterQuery + ' from:' + queryHashtags[i];
			}
		}
	}

	if(queryKeywords !== undefined){
		queryKeywordsCount = queryKeywords.length;
		for(i = 0; i < queryKeywordsCount; i++){
			if(queryKeywords[i] != ""){
				twitterQuery = twitterQuery + ' from:' + queryKeywords[i];
			}
		}
	}

	queryTwitter(twitterQuery, response);
}

function getAnyTweets(clientData, response){
	// var twitterQuery = '';
	// var queryTeam = clientData.team;
	// var queryPlayers = clientData.players;
	// var queryHashtags = clientData.hashtags;
	// var queryKeywords = clientData.keywords;

	// twitterQuery = twitterQuery + ' from:' + queryTeam;

	// if(queryPlayers !== undefined){
	// 	queryPlayersCount = queryPlayers.length;
	// 	for(i = 0; i < queryPlayersCount; i++){
	// 		if(queryPlayers[i] != ""){
	// 			if(twitterQuery == ""){
	// 				twitterQuery = twitterQuery + ' from:' + queryPlayers[i];
	// 			} else {
	// 				twitterQuery = twitterQuery + ' OR from:' + queryPlayers[i];
	// 			}
				
	// 		}
	// 	}
	// }
	// if(queryHashtags !== undefined){
	// 	queryHashtagsCount = queryHashtags.length;
	// 	for(i = 0; i < queryHashtagsCount; i++){
	// 		if(queryHashtags[i] != ""){
	// 			if(twitterQuery == ""){
	// 				twitterQuery = twitterQuery + ' from:' + queryHashtags[i];
	// 			} else {
	// 				twitterQuery = twitterQuery + ' OR from:' + queryHashtags[i];
	// 			}
	// 		}
	// 	}
	// }
	// if(queryKeywords !== undefined){
	// 	queryKeywordsCount = queryKeywords.length;
	// 	for(i = 0; i < queryKeywordsCount; i++){
	// 		if(queryKeywords[i] != ""){
	// 			if(twitterQuery == ""){
	// 				twitterQuery = twitterQuery + ' from:' + queryKeywords[i];
	// 			} else {
	// 				twitterQuery = twitterQuery + ' OR from:' + queryKeywords[i];
	// 			}
	// 		}
	// 	}
	// }
	// queryTwitter(twitterQuery, response);
	twitterClient.get('search/tweets', {q: 'drone', geocode:'51.5072,0.1275,200mi', count: 100 }, function(err, data, result) {
	    tweets = JSON.stringify(data.statuses);

	    response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
	    response.end(tweets);
  });	
}

function queryTwitter(query, response){
	twitterClient.get('search/tweets', { q: query, count:100 }, function(err, data, result) {
		// var returnTweets = [];
		// var totalTweets = data.statuses.length;

		// for(var i=0; i < totalTweets; i++){
		// 	var newTweet = {};
		// 	newTweet.created_at = data.statuses[i].created_at;
		// 	newTweet.entities = data.statuses[i].entities;
		// 	newTweet.text = data.statuses[i].text;
		// 	newTweet.user = {};
		// 	newTweet.user.name = data.statuses[i].user.name;
		// 	newTweet.user.screen_name = data.statuses[i].user.screen_name;
		// 	returnTweets[i] = newTweet;
		// }

	  //   var returnTweets = JSON.stringify(returnTweets);
	  if(data.statuses.length > 0){
	  	var returnTweets = data.statuses;
	  	var maxId = data.statuses[data.statuses.length - 1].id - 1;

	  	twitterClient.get('search/tweets', { q: query, count:100, max_id:maxId}, function(err, data, result) {
	  		if(data.statuses.length > 0){
		  		returnTweets = returnTweets.concat(data.statuses);
		  		maxId = data.statuses[data.statuses.length - 1].id - 1;

		  		twitterClient.get('search/tweets', { q: query, count:100, max_id:maxId}, function(err, data, result) {
		  			if(data.statuses.length > 0){
				  		returnTweets = returnTweets.concat(data.statuses);
				  		returnTweets = JSON.stringify(returnTweets);

				  		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
			    		response.end(returnTweets);
			    	}
			  	});
		  	}
	  	});
	  }
	}); 
}

function getFootballPlayers(response){
	mySqlConnection.connect();
	mySqlConnection.query("CALL get_football_players", function(error, rows){
		var players = rows[0];
		var returnPlayers = []
		for(var i = 0; i < players.length; i++){
			var newPlayer = {}
			newPlayer.name = players[i].footballPlayerName;
			newPlayer.twitterHandle = players[i].footballPlayerTwitterHandle;
			returnPlayers[i] = newPlayer;
		}

		returnPlayers = JSON.stringify(returnPlayers);
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end(returnPlayers);
		mySqlConnection.end();
		mysqlReconnect();
	});
}

function getFootballClubs(response){
	mySqlConnection.connect();
	mySqlConnection.query("CALL get_football_clubs", function(error, rows){
		var clubs = rows[0];
		var returnClubs = []
		for(var i = 0; i < players.length; i++){
			var newClub = {}
			newClub.name = clubs[i].footballClubName;
			newClub.twitterHandle = clubs[i].footballClubTwitterHandle;
			returnClubs[i] = newPlayer;
		}

		returnPlayers = JSON.stringify(returnPlayers);
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end(returnPlayers);
		mySqlConnection.end();
		mysqlReconnect();
	});
}

function mysqlReconnect(){
	mySqlConnection = mysql.createConnection(config.mysql);
}