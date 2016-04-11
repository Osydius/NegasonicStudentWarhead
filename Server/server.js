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
mySqlConnection.connect();

var fileServer = new (static.Server)();
var portNo = config.portNo;

var app = express();
app.use(bodyParser.json());
app.use(cors());
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// }));

var server = app.listen(portNo);

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown); 

/********** GET METHODS **********/
app.get('/getPlayers.html', function (request, response) {
	getFootballPlayers(response);
});

app.get('/getClubs.html', function (request, response) {
	getFootballClubs(response);
});

/********** POST METHODS **********/
app.post('/getAllTweets.html', function(request, response){
	getAllTweets(request.body, response);
});

app.post('/getAnyTweets.html', function(request, response){
	getAnyTweets(request.body, response);
});

app.post('/findClubTwitterHandle.html', function(request, response){
	findClubTwitterHandle(request.body, response);
});

app.post('/findPlayersTwitterHandle.html', function(request, response){
	findPlayersTwitterHandle(request.body, response);
});

function getAllTweets(clientData, response){
	var twitterQuery = '';
	var queryTeam = clientData.team;
	var queryPlayers = clientData.players;
	var queryHashtags = clientData.hashtags;
	var queryKeywords = clientData.keywords;

	twitterQuery = twitterQuery + ' from:' + encodeURIComponent(queryTeam);
	if(queryPlayers !== undefined){
		queryPlayersCount = queryPlayers.length;
		for(i = 0; i < queryPlayersCount; i++){
			if(queryPlayers[i] != ""){
				twitterQuery = twitterQuery + ' from:' + encodeURIComponent(queryPlayers[i]);
			}
		}
	}

	if(queryHashtags !== undefined){
		queryHashtagsCount = queryHashtags.length;
		for(i = 0; i < queryHashtagsCount; i++){
			if(queryHashtags[i] != ""){
				twitterQuery = twitterQuery + ' #' + encodeURIComponent(queryHashtags[i]);
			}
		}
	}

	if(queryKeywords !== undefined){
		queryKeywordsCount = queryKeywords.length;
		for(i = 0; i < queryKeywordsCount; i++){
			if(queryKeywords[i] != ""){
				twitterQuery = twitterQuery + ' ' + encodeURIComponent(queryKeywords[i]);
			}
		}
	}

	// query, response, totalTweets, lastId, currentTweets
	queryTwitter(twitterQuery, response, 300, 0, null);
}

function getAnyTweets(clientData, response){
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
				if(twitterQuery == ""){
					twitterQuery = twitterQuery + ' from:' + queryPlayers[i];
				} else {
					twitterQuery = twitterQuery + ' OR from:' + queryPlayers[i];
				}
				
			}
		}
	}
	if(queryHashtags !== undefined){
		queryHashtagsCount = queryHashtags.length;
		for(i = 0; i < queryHashtagsCount; i++){
			if(queryHashtags[i] != ""){
				if(twitterQuery == ""){
					twitterQuery = twitterQuery + ' from:' + queryHashtags[i];
				} else {
					twitterQuery = twitterQuery + ' OR from:' + queryHashtags[i];
				}
			}
		}
	}
	if(queryKeywords !== undefined){
		queryKeywordsCount = queryKeywords.length;
		for(i = 0; i < queryKeywordsCount; i++){
			if(queryKeywords[i] != ""){
				if(twitterQuery == ""){
					twitterQuery = twitterQuery + ' from:' + queryKeywords[i];
				} else {
					twitterQuery = twitterQuery + ' OR from:' + queryKeywords[i];
				}
			}
		}
	}
	queryTwitter(twitterQuery, response);
}

function queryTwitter(query, response, totalTweets, lastId, returnedTweets){
	var maxRetrievableTweets = 100;
	if(returnedTweets == null){
		twitterClient.get('search/tweets', { q: query, count: maxRetrievableTweets }, function(error, data, result) {
			if(error){
				console.log(error);
			} else if(data.statuses != undefined){
				if(data.statuses.length > 0){
					// add tweets to database

					// build return tweets
					returnedTweets = data.statuses;
					var maxId = data.statuses[data.statuses.length - 1].id - 1;
					if(returnedTweets != undefined && returnedTweets.length < totalTweets && data.statuses.length == maxRetrievableTweets){
						queryTwitter(query, response, totalTweets, maxId, returnedTweets);
					} else {
						insertNewTweets(returnedTweets);
						returnedTweets= JSON.stringify(returnedTweets);
						response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		    			response.end(returnedTweets);
					}
				} else {
					console.log("no statuses found");
				}
			}
		});
	} else if(returnedTweets.length > 0 && returnedTweets.length != totalTweets){
		twitterClient.get('search/tweets', { q: query, count: maxRetrievableTweets, max_id: lastId }, function(error, data, result) {
			if(error){
				console.log(error);
			} else if(data.statuses != undefined){
				if(data.statuses.length > 0){
					returnedTweets = returnedTweets.concat(data.statuses);
					var maxId = data.statuses[data.statuses.length - 1].id - 1;
					if(returnedTweets != undefined && returnedTweets.length < totalTweets && data.statuses.length == maxRetrievableTweets){
						queryTwitter(query, response, totalTweets, maxId, returnedTweets);
					} else {
						insertNewTweets(returnedTweets);
						returnedTweets= JSON.stringify(returnedTweets);
						response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		    			response.end(returnedTweets);
					}
				} else {
					console.log("no statuses found");
				}
			}
		});
	}
	// twitterClient.get('search/tweets', { q: query, count:100 }, function(err, data, result) {
	//   if(data.statuses.length > 0){
	//   	var returnTweets = data.statuses;
	//   	var maxId = data.statuses[data.statuses.length - 1].id - 1;

	//   	twitterClient.get('search/tweets', { q: query, count:100, max_id:maxId}, function(err, data, result) {
	//   		if(data.statuses.length > 0){
	// 	  		returnTweets = returnTweets.concat(data.statuses);
	// 	  		maxId = data.statuses[data.statuses.length - 1].id - 1;

	// 	  		twitterClient.get('search/tweets', { q: query, count:100, max_id:maxId}, function(err, data, result) {
	// 	  			if(data.statuses.length > 0){
	// 			  		returnTweets = returnTweets.concat(data.statuses);
	// 			  		returnTweets = JSON.stringify(returnTweets);

	// 			  		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
	// 		    		response.end(returnTweets);
	// 		    	}
	// 		  	});
	// 	  	}
	//   	});
	//   }
	// }); 
}

function getFootballPlayers(response){
	mySqlConnection.query("SELECT * FROM footballplayers", function(error, rows){
		var players = rows;
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
	});
}

function getFootballClubs(response){
	mySqlConnection.query("SELECT * FROM footballclubs", function(error, rows){
		var clubs = rows;
		var returnClubs = []
		for(var i = 0; i < clubs.length; i++){
			var newClub = {}
			newClub.name = clubs[i].footballClubName;
			newClub.twitterHandle = clubs[i].footballClubTwitterHandle;
			returnClubs[i] = newClub;
		}

		returnClubs = JSON.stringify(returnClubs);
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end(returnClubs);
	});
}

function findClubTwitterHandle(data, response){
	mySqlConnection.query("SELECT footballClubTwitterHandle FROM footballClubs WHERE footballClubName = ?", [data], function(error, result){
		returnClubTwitterHandle = JSON.stringify(result);
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end(returnClubTwitterHandle);
	});
}

function findPlayersTwitterHandle(data, response){
	var totalSearches = data.length;
	var currentPlayerSearch = 0;
	var currentResults = [];
	console.log("Looking for " + totalSearches + " players.");
	if(data.length > 0){
		findPlayerTwitterHandle(data, totalSearches, currentPlayerSearch, currentResults, response);
	} else {
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end("Nothing to validate");
	}
	
}

function findPlayerTwitterHandle(playerNames, totalSearches, currentPlayerSearch, currentResults, response){
	console.log("Search number: " + currentPlayerSearch);
	mySqlConnection.query("SELECT * FROM footballplayers WHERE footballPlayerName = ?", [playerNames[currentPlayerSearch]], function(error, result){
		if(result.length > 0){
			console.log(result);
			currentResults.push(result);
			console.log(currentResults);
		}
		if(currentPlayerSearch < totalSearches - 1){
			currentPlayerSearch++;
			findPlayerTwitterHandle(playerNames, totalSearches, currentPlayerSearch, currentResults, response);
		} else {
			console.log(currentResults);
			currentResults = JSON.stringify(currentResults);
			response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
			response.end(currentResults);
		}
	});
}

function insertNewTweets(allTweets){
	if(allTweets.length > 0){
		for(i=0;i<allTweets.length;i++){
			newTwitterUser(allTweets[i]);
		}
	}
}

function newTwitterUser(tweetInfo){
	var userInfo = tweetInfo.user;
	var newUserInfo = {twitterUserName: userInfo.name, twitterUserScreenName: userInfo.screen_name, twitterUserTwitterId: userInfo.id};

	mySqlConnection.query('SELECT * FROM twitterusers WHERE twitterUserTwitterId = ?', [userInfo.id], function(error, result){
		if(error != null){
			console.log(error)
		}
		if(result.length == 0){
			mySqlConnection.query("INSERT INTO twitterusers SET ?", newUserInfo, function(error, result){
				if(error != null){
					console.log(error)
				}
				tweetUserId = result.insertId;
				newTweet(tweetInfo, tweetUserId);
			});
		} else {
			newTweet(tweetInfo, result[0].twitterUserId);
		}	
	});
}

function newTweet(tweetInfo, userOfTweetId){
	var newCreatedAtTime = new Date(Date.parse(tweetInfo.created_at));
	var newDateAdded = new Date();
	var newTweetInfo = {twitterUserId: userOfTweetId, tweetCreatedAt: newCreatedAtTime, tweetText: tweetInfo.text, tweetDateAdded: newDateAdded};

	mySqlConnection.query("SELECT * FROM tweets WHERE tweetText = ?", [tweetInfo.text], function(error, result){
		if(error != null){
			console.log(error)
		}
		if(result.length == 0){
			mySqlConnection.query("INSERT INTO tweets SET ?", newTweetInfo, function(error, result){
				if(error != null){
					console.log(error)
				}
				newInsertedTweetId = result.insertId;

				//now add any tweet links (users, hashtags, url, media)
				if(tweetInfo.entities.user_mentions.length > 0){
					newUserMention(tweetInfo, newInsertedTweetId);
				}

				if(tweetInfo.entities.hashtags.length > 0){
					newTwitterHashtags(tweetInfo, newInsertedTweetId);
				}

				if(tweetInfo.entities.urls > 0){
					newTwitterUrls(tweetInfo, newInsertedTweetId);
				}
			});
		} else {
			//now add any tweet links (users, hashtags, url, media)
			if(tweetInfo.entities.user_mentions.length > 0){
				newUserMention(tweetInfo, result[0].tweetId);
			}

			if(tweetInfo.entities.hashtags.length > 0){
				newTwitterHashtags(tweetInfo, result[0].tweetId);
			}

			if(tweetInfo.entities.urls > 0){
				newTwitterUrls(tweetInfo, result[0].tweetId);
			}
		}
	});
}

function newUserMention(tweetInfo, tweetId){
	for(i=0;i<tweetInfo.entities.user_mentions.length;i++){
		var currentUserMention = tweetInfo.entities.user_mentions[i];
		mySqlConnection.query("SELECT * FROM twitterusers WHERE twitterUserTwitterId = ?", [currentUserMention.id_str], function(error, result){
			if(error != null){
				console.log(error)
			}
			if(result.length == 0){
				newUserInfo = {twitterUserName: currentUserMention.name, twitterUserScreenName: currentUserMention.screen_name, twitterUserTwitterId: currentUserMention.id_str}
				mySqlConnection.query("INSERT INTO twitterusers SET ?", newUserInfo, function(error, result){
					if(error != null){
						console.log(currentUserMention.id)
						console.log(error)
					}
					userMentionUserId = result.insertId;
					newTweetUser(tweetId, userMentionUserId, currentUserMention.indices[0], currentUserMention.indices[1]);
				});
			} else {
				newTweetUser(tweetId, result[0].twitterUserId, currentUserMention.indices[0], currentUserMention.indices[1]);
			}
		});
	}
}

function newTweetUser(tweetId, userMentionId, startPoint, endPoint){
	var newTweetUserInfo = {tweetId: tweetId, twitterUserId: userMentionId, tweetStartPoint: startPoint, tweetEndPoint: endPoint};
	mySqlConnection.query("INSERT INTO tweetusers SET ?", newTweetUserInfo, function(error, result){
		//TODO: Check for any errors
	});
}

function newTwitterHashtags(tweetInfo, tweetId){
	for(var i=0; i< tweetInfo.entities.hashtags.length;i++){
		var currentHashtag = tweetInfo.entities.hashtags[i];
		mySqlConnection.query("SELECT * FROM twitterhashtags WHERE twitterHashtagText = ?", [currentHashtag.text], function(error, result){
			if(error != null){
				console.log(error)
			}
			if(result.length == 0){
				newHashtagInfo = {twitterHashtagText: currentHashtag.text};
				mySqlConnection.query("INSERT INTO twitterhashtags SET ?", newHashtagInfo, function(error, result){
					if(error != null){
						console.log(error)
					}
					newHashtagId = result.insertId;
					newTweetTwitterHashtag(tweetId, newHashtagId, currentHashtag.indices[0], currentHashtag.indices[1]);
				});
			} else {
				newTweetTwitterHashtag(tweetId, result[0].twitterHashtagId, currentHashtag.indices[0], currentHashtag.indices[1]);
			}
		});
	}
}

function newTweetTwitterHashtag(tweetId, hashtagId, startPoint, endPoint){
	var newTweetTwitterHashtagInfo = {tweetTwitterHashtagTweetId: tweetId, tweetTwitterHashtagTwitterHashtagId: hashtagId, tweetTwitterHashtagStartPoint: startPoint, tweetTwitterHashtagEndPoint: endPoint};
	mySqlConnection.query("INSERT INTO tweettwitterhashtags SET ?", newTweetTwitterHashtagInfo, function(error, result){
		//TODO: Check for any errors
	});
}

function newTwitterUrls(tweetInfo, tweetId){
	for(var i=0; i< tweetInfo.entities.urls.length;i++){
		var currentUrl = tweetInfo.entities.urls[i];
		mySqlConnection.query("SELECT * FROM twitterurls WHERE url = ?", [currentUrl.url], function(error, result){
			if(error != null){
				console.log(error)
			}
			if(result.length == 0){
				newUrlInfo = {twitterUrlUrl: currentUrl.url, twitterUrlExpandedUrl: currentUrl.expanded_url, twitterUrlDisplayUrl: currentUrl.display_url};
				mySqlConnection.query("INSERT INTO twitterurls SET ?", newUrlInfo, function(error, result){
					if(error != null){
						console.log(error)
					}
					newUrlId = result.insertId;
					newTweetTwitterUrl(tweetId, newUrlId, currentUrl.indices[0], currentUrl.indices[1]);
				});
			} else {
				newTweetTwitterUrl(tweetId, result[0].twitterUrlId, currentUrl.indices[0], currentUrl.indices[1]);
			}
		});
	}
}

function newTweetTwitterUrl(tweetId, urlId, startPoint, endPoint){
	var newTweetTwitterUrlInfo = {tweetTwitterUrlTweetId: tweetId, tweetTwitterUrlTwitterUrlId: hashtagId, tweetTwitterUrlStartPoint: startPoint, tweetTwitterUrlEndPoint: endPoint};
	mySqlConnection.query("INSERT INTO tweettwitterurls SET ?", newTweetTwitterUrlInfo, function(error, result){
		//TODO: Check for any errors
	});
}


function gracefulShutdown(){
	console.log("Received kill signal, shutting down gracefully.");
	mySqlConnection.end();
	server.close(function() {
		console.log("Closed out remaining connections.");
		process.exit()
	});
  
	// if after 
	setTimeout(function() {
	   console.error("Could not close connections in time, forcefully shutting down");
	   process.exit()
	}, 5*1000);
}