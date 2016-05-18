/*
*
* Authors: James Hall and Nicola Willis
* Team: NegasonicStudentWarhead
*
*/

//Require nodejs plugins
var protocol = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var static = require('node-static');
var loadash = require('lodash');
var Twit = require('twit');
var mysql = require('mysql');
var SparqlClient = require('sparql-client')
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var weather = require('openweather-node');

var config = require('./config.js');

//Initialise twitter and mysql and DBPedia connections
var twitterClient = new Twit(config.twitter);

var mySqlConnection = mysql.createConnection(config.mysql);
mySqlConnection.connect();

var DBPediaEndpoint = 'http://dbpedia.org/sparql';
var DBPediaClient = new SparqlClient(DBPediaEndpoint);

weather.setAPPID(config.openWeather);
weather.setCulture("en");
weather.setForecastType("daily");

//Initialise server information
var fileServer = new (static.Server)();
var portNo = config.portNo;

//Initialise server variables
var totalTweetsWanted = 300;

//Create the express app
var app = express();
app.use(bodyParser.json());
app.use(cors());

//Create and sart the server
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
	//getAllTweets(request.body, response);
	getAllDatabaseTweets(request.body, response);
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

app.post('/journalistBrief.html', function(request, response){
	getJournalistBrief(request.body, response);
});

app.post('/getPlayerHistory.html', function(request, response){
	getPlayerHistory(request.body, response);
});

/*
* Takes a set of query data to generate a query that will be used to get tweets from Twitter using the search API.
* The query using AND logic to search for all applicable tweets. When a team and player Twitter-handles are provided,
* the query will return only tweets from those users.
* @param {object} clientData - holds the query data that a user has provided. Contains a team's Twitter-handle,
*                              an array of players' Twitter-handles, an array of hashtags and an array of keywords
*                              that are used to build the Twitter query.
* @param {object} response - The response object that will be used to send the results of the user's query back to the
*                            user.
* @param {array} currentResults - An array that holds all the relevant tweets from the database.
*/
function getAllTweets(clientData, response, currentResults){
	var twitterQuery = '';
	var queryTeam = clientData.team;
	var queryPlayers = clientData.players;
	var queryHashtags = clientData.hashtags;
	var queryKeywords = clientData.keywords;

	//Add the team's Twitter-handle to the Twitter query
	twitterQuery = twitterQuery + ' from:' + encodeURIComponent(queryTeam);

	//Add all the players' Twitter-handles to the Twitter query
	if(queryPlayers !== undefined){
		queryPlayersCount = queryPlayers.length;
		for(i = 0; i < queryPlayersCount; i++){
			if(queryPlayers[i] != ""){
				twitterQuery = twitterQuery + ' from:' + encodeURIComponent(queryPlayers[i]);
			}
		}
	}

	//Add all the hashtags to the Twitter query
	if(queryHashtags !== undefined){
		queryHashtagsCount = queryHashtags.length;
		for(i = 0; i < queryHashtagsCount; i++){
			if(queryHashtags[i] != ""){
				twitterQuery = twitterQuery + ' #' + encodeURIComponent(queryHashtags[i]);
			}
		}
	}

	//Add all the keywords to the Twitter query
	if(queryKeywords !== undefined){
		queryKeywordsCount = queryKeywords.length;
		for(i = 0; i < queryKeywordsCount; i++){
			if(queryKeywords[i] != ""){
				twitterQuery = twitterQuery + ' ' + encodeURIComponent(queryKeywords[i]);
			}
		}
	}

	//Execute the Twitter query asking to find 300 tweets, unless tweets were found in the database
	if(currentResults == null){
		queryTwitter(twitterQuery, response, totalTweetsWanted, 0, null, currentResults);
	} else {
		queryTwitter(twitterQuery, response, totalTweetsWanted - currentResults.length, 0, null, currentResults);
	}

}

/*
* Takes a set of query data to generate a query that will be used to get tweets from Twitter using the search API.
* The query using OR logic to search for all applicable tweets. When a team and player Twitter-handles are provided,
* the query will return only tweets from those users.
* @param {object} clientData - holds the query data that a user has provided. Contains a team's Twitter-handle,
*                              an array of players' Twitter-handles, an array of hashtags and an array of keywords
*                              that are used to build the Twitter query.
* @param {object} response - The response object that will be used to send the results of the user's query back to the
*                            user.
* @param {array} currentResults - An array that holds all the relevant tweets from the database.
*/
function getAnyTweets(clientData, response, currentResults){
	var twitterQuery = '';
	var queryTeam = clientData.team;
	var queryPlayers = clientData.players;
	var queryHashtags = clientData.hashtags;
	var queryKeywords = clientData.keywords;

	//Add the team's Twitter-handle to the Twitter query
	twitterQuery = twitterQuery + ' from:' + encodeURIComponent(queryTeam);

	//Add all the players' Twitter-handles to the Twitter query
	if(queryPlayers !== undefined){
		queryPlayersCount = queryPlayers.length;
		for(i = 0; i < queryPlayersCount; i++){
			if(queryPlayers[i] != ""){
				if(twitterQuery == ""){
					twitterQuery = twitterQuery + ' from:' + encodeURIComponent(queryPlayers[i]);
				} else {
					twitterQuery = twitterQuery + ' OR from:' + encodeURIComponent(queryPlayers[i]);
				}

			}
		}
	}

	//Add all the hashtags to the Twitter query
	if(queryHashtags !== undefined){
		queryHashtagsCount = queryHashtags.length;
		for(i = 0; i < queryHashtagsCount; i++){
			if(queryHashtags[i] != ""){
				if(twitterQuery == ""){
					twitterQuery = twitterQuery + ' from:' + encodeURIComponent(queryHashtags[i]);
				} else {
					twitterQuery = twitterQuery + ' OR from:' + encodeURIComponent(queryHashtags[i]);
				}
			}
		}
	}

	//Add all the keywords to the Twitter query
	if(queryKeywords !== undefined){
		queryKeywordsCount = queryKeywords.length;
		for(i = 0; i < queryKeywordsCount; i++){
			if(queryKeywords[i] != ""){
				if(twitterQuery == ""){
					twitterQuery = twitterQuery + ' from:' + encodeURIComponent(queryKeywords[i]);
				} else {
					twitterQuery = twitterQuery + ' OR from:' + encodeURIComponent(queryKeywords[i]);
				}
			}
		}
	}

	//Execute the Twitter query asking to find 300 tweets, unless tweets were found in the database
	if(currentResults == null){
		queryTwitter(twitterQuery, response, totalTweetsWanted, 0, null, currentResults);
	} else {
		queryTwitter(twitterQuery, response, totalTweetsWanted - currentResults.length, 0, null, currentResults);
	}
}

/*
* Takes a generated Twitter query and collates the results until the requested amount of tweets has been found.
* This function is recursive, due to the Twitter API only returning a maximum of 100 tweets for each query, multiple calls
* must be made to reach the requested maximum. Once the maximum number of tweets has been reached or the query has been exhausted,
* the results of returned to the user of the current query using the response object.
* @param {string} query - The query that will be used to collect tweets from the Twitter search API.
* @param {object} response - The object that will be used to return the results of the query to the user.
* @param {integer} totalTweets - The upper limit of the number of tweets that must be found. Won't be reached if no more tweets can
*                                be found for the query.
* @param {integer} lastId - This is the id of the last tweet to be found, used when recursing through Twitter's data structure to reduce
*                           duplicate tweets being returned.
* @param {array} returnedTweets - An array of all the tweets that have been returned from the Twitter search API currently.
* @param {array} databaseTweets - An array of all the tweets that the database returned. These will be combined with the tweets returned
*                                 from the Twitter search API.
*/
function queryTwitter(query, response, totalTweets, lastId, returnedTweets, databaseTweets){
	var maxRetrievableTweets = 100;
	if(returnedTweets == null){
		twitterClient.get('search/tweets', { q: query, count: maxRetrievableTweets }, function(error, data, result) {
			if(error){
				console.log(error);
			} else if(data.statuses != undefined){
				if(data.statuses.length > 0){
					returnedTweets = data.statuses;
					var maxId = data.statuses[data.statuses.length - 1].id - 1;

					if(returnedTweets != undefined && returnedTweets.length < totalTweets && data.statuses.length == maxRetrievableTweets){
						queryTwitter(query, response, totalTweets, maxId, returnedTweets, databaseTweets);
					} else {
						insertNewTweets(returnedTweets);

						if(databaseTweets != null){
							for(var i=0; i < databaseTweets.length;i++){
								returnedTweets.push(databaseTweets[i]);
							}
						}
						//The following log returns all the tweets found so that they can be recorded.
						returnedTweets= JSON.stringify(returnedTweets);
						response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		    		response.end(returnedTweets);
					}
				} else {
					console.log("no statuses found");
					returnedTweets = JSON.stringify(null);
					response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
	    		response.end(returnedTweets);
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
						queryTwitter(query, response, totalTweets, maxId, returnedTweets, databaseTweets);
					} else {
						insertNewTweets(returnedTweets);
						if(databaseTweets != null){
							for(var i=0; i < databaseTweets.length;i++){
								returnedTweets.push(databaseTweets[i]);
							}
						}
						//The following log returns all the tweets found so that they can be recorded.
						returnedTweets= JSON.stringify(returnedTweets);
						response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		    			response.end(returnedTweets);
					}
				} else {
					console.log("no statuses found");
					returnedTweets = JSON.stringify(null);
					response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
	    		response.end(returnedTweets);
				}
			}
		});
	}
}

/*
* This function returns all the entries for football players in the database for use in validation.
* The results are then passed to the user using the response object.
* @param {object} response - The reponse object used to supply the database results to the user.
*/
function getFootballPlayers(response){
	mySqlConnection.query("SELECT * FROM footballplayers", function(error, rows){
		var players = rows;
		var returnPlayers = []
		for(var i = 0; i < players.length; i++){
			var newPlayer = {}
			newPlayer.name = players[i].footballPlayerName;
			newPlayer.twitterHandle = players[i].footballPlayerTwitterHandle;
			newPlayer.dbpediaPage = players[i].footballPlayerDBPediaPage;
			returnPlayers[i] = newPlayer;
		}

		returnPlayers = JSON.stringify(returnPlayers);
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end(returnPlayers);
	});
}

/*
* This function returns all the entries for football clubs in the database for use in validation.
* The results are then passed to the user using the response object.
* @param {object} response - The reponse object used to supply the database results to the user.
*/
function getFootballClubs(response){
	mySqlConnection.query("SELECT * FROM footballclubs", function(error, rows){
		var clubs = rows;
		var returnClubs = []
		for(var i = 0; i < clubs.length; i++){
			var newClub = {}
			newClub.name = clubs[i].footballClubName;
			newClub.twitterHandle = clubs[i].footballClubTwitterHandle;
			newClub.dbpediaPage = clubs[i].footballClubDBPediaPage;
			returnClubs[i] = newClub;
		}

		returnClubs = JSON.stringify(returnClubs);
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end(returnClubs);
	});
}

/*
* This function returns a Twitter handle of a specific club when given a football club name.
* This is used for validating user input and to provide the Twitter handle to pass to the query.
* @param {object} data - The football club name that the user has specified.
* @param {object} response - The response object used to return the result to the user.
*/
function findClubTwitterHandle(data, response){
	mySqlConnection.query("SELECT footballClubTwitterHandle FROM footballClubs WHERE footballClubName = ?", [data], function(error, result){
		returnClubTwitterHandle = JSON.stringify(result);
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end(returnClubTwitterHandle);
	});
}

/*
* This function initiates a search for a Twitter handle of a specific player when given a football player name.
* This is used for validating user input and to provide the Twitter handle to pass to the query.
* @param {object} data - the football player name that the user has specified.
* @param {object} response - The response object used to return the result to the user.
*/
function findPlayersTwitterHandle(data, response){
	var totalSearches = data.length;
	var currentPlayerSearch = 0;
	var currentResults = [];
	if(data.length > 0){
		findPlayerTwitterHandle(data, totalSearches, currentPlayerSearch, currentResults, response);
	} else {
		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end("Nothing to validate");
	}

}

/*
* Taking a list of player names, this function will recurse through the database to find each player and return
* the Twitter handle of all the players that it finds. It then returns the results to the user that requested them.
* @param {array} playerName - An array that contains all the names of the players to be searched for.
* @param {integer} totalSearches - The total amount of searches that the function has to recurse for.
* @param {integer} currentPlayerSearch - The index of the current player currently being searched for.
* @param {array} currentResults - An array containing all the players that have been found in the database.
* @param {object} response - The reponse object used to return the results to the user.
*/
function findPlayerTwitterHandle(playerNames, totalSearches, currentPlayerSearch, currentResults, response){
	mySqlConnection.query("SELECT * FROM footballplayers WHERE footballPlayerName = ?", [playerNames[currentPlayerSearch]], function(error, result){
		if(result.length > 0){
			currentResults.push(result);
		}
		if(currentPlayerSearch < totalSearches - 1){
			currentPlayerSearch++;
			findPlayerTwitterHandle(playerNames, totalSearches, currentPlayerSearch, currentResults, response);
		} else {
			currentResults = JSON.stringify(currentResults);
			response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
			response.end(currentResults);
		}
	});
}

/*
* Taking all the tweets that have been found using the Twitter search API, loops through them and initiates their insertion
* into the database.
* @param {array} allTweets - An array containing all the tweets that have been returned from the Twitter search API.
*/
function insertNewTweets(allTweets){
  if(allTweets.length > 0){
    for(i=0;i<allTweets.length;i++){
      newTwitterUser(allTweets[i]);
    }
  }
}

/*
* This is the first step to add a tweet to the database. It checks if the user who wrote the tweet is currently in the database,
* if not then that user is added.
* @param {object} tweetInfo - An object that contains all the information about the tweet currently being added to the database.
*/
function newTwitterUser(tweetInfo){
	var userInfo = tweetInfo.user;
	var newUserInfo = {twitterUserName: userInfo.name, twitterUserScreenName: userInfo.screen_name, twitterUserTwitterId: userInfo.id_str};

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

/*
* This uses the database ID of the user asscociated with writing the tweet and the specific tweet information to add a new tweet to
* the database. If the tweet already exists, by comparing the tweet ID, then it skips to the next stage of entering a tweet in the database.
* @param {object} tweetInfo - An object that contains all the information about the tweet currently being added to the database.
* @param {integer} userOfTweetId - The ID of database entry associated with the user who wrote the tweet.
*/
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

				if(tweetInfo.entities.urls.length > 0){
					newTwitterUrls(tweetInfo, newInsertedTweetId);
				}

				if('media' in tweetInfo.entities){
					if(tweetInfo.entities.media.length > 0){
						newTwitterMedia(tweetInfo, newInsertedTweetId);
					}
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

			if(tweetInfo.entities.urls.length > 0){
				newTwitterUrls(tweetInfo, result[0].tweetId);
			}

			if('media' in tweetInfo.entities){
				if(tweetInfo.entities.media.length > 0){
					newTwitterMedia(tweetInfo, result[0].tweetId);
				}
			}
		}
	});
}

/*
* This loops through all the user mentions in the current tweet and adds them to the database. It checks to see if each user that has been
* mentioned already exists in the database, if not then it adds the user and then creates a link between the tweet and the user.
* @param {object} tweetInfo - An object that contains all the information about the tweet currently being added to the database.
* @param {integer} tweetId - The ID of the tweet that the user mentions are associated with so that they can be linked.
*/
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

/*
* This function is designed to create the link between user mentions associated with a tweet and a user.
* The start and end point are provided so that the text in the tweet can be replaced when displayed for a user.
* @param {integer} tweetId - The ID of the tweet that the user mentions are associated with so that they can be linked.
* @param {integer} userMentionId - The ID of the user that the tweet mentions.
* @param {integer} startPoint - The starting position where the user is mentioned.
* @param {integer} endPoint - The end position where the user is mentioned.
*/
function newTweetUser(tweetId, userMentionId, startPoint, endPoint){
	var newTweetUserInfo = {tweetId: tweetId, twitterUserId: userMentionId, tweetStartPoint: startPoint, tweetEndPoint: endPoint};
	mySqlConnection.query("INSERT INTO tweetusers SET ?", newTweetUserInfo, function(error, result){
		//TODO: Check for any errors
	});
}

/*
* This loops through all the hashtags in the current tweet and adds them to the database. It checks to see if each hashtag that has been
* mentioned already exists in the database, if not then it adds the hashtag and then creates a link between the tweet and the hashtag.
* @param {object} tweetInfo - An object that contains all the information about the tweet currently being added to the database.
* @param {integer} tweetId - The ID of the tweet that the hashtags are associated with so that they can be linked.
*/
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

/*
* This function is designed to create the link between hashtags associated with a tweet and a tweet.
* The start and end point are provided so that the text in the tweet can be replaced when displayed for a user.
* @param {integer} tweetId - The ID of the tweet that the user mentions are associated with so that they can be linked.
* @param {integer} hashtagId - The ID of the hashtag that the tweet uses.
* @param {integer} startPoint - The starting position where the hashtag is used.
* @param {integer} endPoint - The end position where the hashtag is used.
*/
function newTweetTwitterHashtag(tweetId, hashtagId, startPoint, endPoint){
	var newTweetTwitterHashtagInfo = {tweetTwitterHashtagTweetId: tweetId, tweetTwitterHashtagTwitterHashtagId: hashtagId, tweetTwitterHashtagStartPoint: startPoint, tweetTwitterHashtagEndPoint: endPoint};
	mySqlConnection.query("INSERT INTO tweettwitterhashtags SET ?", newTweetTwitterHashtagInfo, function(error, result){
		//TODO: Check for any errors
	});
}

/*
* This loops through all the urls in the current tweet and adds them to the database. It checks to see if each url that has been
* mentioned already exists in the database, if not then it adds the url and then creates a link between the tweet and the url.
* @param {object} tweetInfo - An object that contains all the information about the tweet currently being added to the database.
* @param {integer} tweetId - The ID of the tweet that the urls are associated with so that they can be linked.
*/
function newTwitterUrls(tweetInfo, tweetId){
	for(var i=0; i< tweetInfo.entities.urls.length;i++){
		var currentUrl = tweetInfo.entities.urls[i];
		mySqlConnection.query("SELECT * FROM twitterurls WHERE twitterUrlUrl = ?", [currentUrl.url], function(error, result){
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

/*
* This function is designed to create the link between hashtags associated with a tweet and a tweet.
* The start and end point are provided so that the text in the tweet can be replaced when displayed for a user.
* @param {integer} tweetId - The ID of the tweet that the user mentions are associated with so that they can be linked.
* @param {integer} hashtagId - The ID of the url that the tweet uses.
* @param {integer} startPoint - The starting position where the url is used.
* @param {integer} endPoint - The end position where the url is used.
*/
function newTweetTwitterUrl(tweetId, urlId, startPoint, endPoint){
	var newTweetTwitterUrlInfo = {tweetTwitterUrlTweetId: tweetId, tweetTwitterUrlTwitterUrlId: urlId, tweetTwitterUrlStartPoint: startPoint, tweetTwitterUrlEndPoint: endPoint};
	mySqlConnection.query("INSERT INTO tweettwitterurls SET ?", newTweetTwitterUrlInfo, function(error, result){
		//TODO: Check for any errors
	});
}

function newTwitterMedia(tweetInfo, tweetId){
	for(var i=0; i <tweetInfo.entities.media.length; i++){
		var currentMedia = tweetInfo.entities.media[i];
		mySqlConnection.query("SELECT * FROM twittermedias WHERE twitterMediaUrl = ?", [currentMedia.media_url], function(error, result){
			if(error != null){
				console.log(error)
			}
			if(result.length == 0){
				newMediaInfo = {twitterMediaUrl: currentMedia.media_url, twitterMediaMediaId: currentMedia.id_str, twitterMediaType: currentMedia.type};
				mySqlConnection.query("INSERT INTO twittermedias SET ?", newMediaInfo, function(error, result){
					if(error != null){
						console.log(error)
					}
					newMediaId = result.insertId;
					newTweetTwitterMedia(tweetId, newMediaId, currentMedia.indices[0], currentMedia.indices[1]);
				});
			} else {
				newTweetTwitterMedia(tweetId, result[0].twitterMediaId, currentMedia.indices[0], currentMedia.indices[1]);
			}
		});
	}
}

function newTweetTwitterMedia(tweetId, mediaId, startPoint, endPoint){
	var newTweetTwitterMediaInfo = {tweetTwitterMediaTweetId: tweetId, tweetTwitterMediaTwitterMediaId: mediaId, tweetTwitterMediaStartPoint: startPoint, tweetTwitterMediaEndPoint: endPoint};
	mySqlConnection.query("INSERT INTO tweettwittermedias SET ?", newTweetTwitterMediaInfo, function(error, result){
		//TODO: Check for any errors
	});
}

/*
* This function starts to get all the tweets from the database using the query data provided by the user.
* It starts by getting all the users that are associated with the query and then passes it to another function that deals with
* getting the actual tweets.
* @param {object} queryData - An object that stores the query data. Contains the team name, potential players, potential hashtags
*                             and potential keywords that will be used in the query.
* @param {object} response - A response object that will be used to return the results once they have been found.
*/
function getAllDatabaseTweets(queryData, response){
	var currentResults = [];
	mySqlConnection.query('SELECT * FROM twitterusers WHERE twitterUserScreenName = ?', [queryData.team], function(error, result){
		if(result.length != 0){
			var userIdList = [];
			var userInfo = {};
			userInfo.name = result[0].twitterUserName;
			userInfo.screen_name = result[0].twitterUserScreenName;
			for(var i=0;i<result.length;i++){
				userIdList.push(result[i].twitterUserId);

				var newUser = {};
			}
			getDatabaseQueryTweets(queryData, response, userIdList, 0, [], userInfo, 'all')
		} else {
			getAllTweets(queryData, response, null)
		}
	});
}

/*
* This function currently finds all the tweets in the database recusively that are associated with the users provided.
* It then checks to see if the tweets are relevant by checking to see if they contain the hashtags or keywords.
* @param {object} - An object that stores the query data. Contains the team name, potential players, potential hashtags
*                             and potential keywords that will be used in the query.
* @param {response} - A response object that will be used to return the results once they have been found.
* @param {array} tweetUserIds - An array of user IDs that tweets need to be associated with.
* @param {integer} currentSearch - The index of the current user ID that is being searched with.
* @param {array} currentResults - An array containing all of the results of the database query up to this point.
* @param {object} userInfo - An object that contains the user information for the first user that has been found. This reduces
*                            the need to use repeated information if duplicates are created.
* @param {string} queryType - The type of query that is currently being used 'any' or 'all'.
*/
function getDatabaseQueryTweets(queryData, response, tweetUserIds, currentSearch, currentResults, userInfo, queryType){
	mySqlConnection.query('SELECT * FROM tweets WHERE twitterUserId = ?', [tweetUserIds[currentSearch]], function(error, result){
		if(result.length != 0){
			for(var i=0;i<result.length;i++){
				currentResults.push(result[i]);
			}
		}

		if(currentSearch != tweetUserIds.length - 1){
			currentSearch++;
			getDatabaseQueryTweets(queryData, response, tweetUserIds, currentSearch, currentResults, userInfo, queryType);
		} else {
			var tempReturnResults = [];
			// loop through all the tweets asscociated with the users
			for(var i=0; i<currentResults.length; i++){
				//check to see if the current tweet is relevant
				var currentTweet = currentResults[i];
				var sendBack = true;

				if(queryData.hashtags.length != 0){
					for(var j=0;j<queryData.hashtags.length;j++){
						if(currentTweet.tweetText.indexOf('#' + queryData.hashtags[j]) == -1){
							sendBack = false;
						}
					}
				}

				if(queryData.keywords.length != 0){
					for(var j=0;j<queryData.keywords.length;j++){
						if(currentTweet.tweetText.indexOf('#' + queryData.keywords[j]) == -1){
							sendBack = false;
						}
					}
				}

				if(sendBack){
					tempReturnResults.push(currentTweet);
				}
			}

			var returnResults = [];
			for(var i=0; i<tempReturnResults.length;i++){
				var newReturnTweet = {};
				newReturnTweet.id = tempReturnResults[i].tweetId;
				newReturnTweet.text = tempReturnResults[i].tweetText;

				var newTweetDate = new Date(tempReturnResults[i].tweetCreatedAt)
				newReturnTweet.created_at = newTweetDate.toString();
				newReturnTweet.user = userInfo;

				var newTweetEntities = {};
				newTweetEntities.hashtags = [];
				newTweetEntities.user_mentions = [];
				newTweetEntities.urls = [];
				newTweetEntities.media = [];
				newReturnTweet.entities = newTweetEntities;

				returnResults.push(newReturnTweet);
			}

			if(returnResults.length < totalTweetsWanted){
				if(queryType == 'all'){
					getAllTweets(queryData, response, returnResults);
				} else if(queryType == 'any'){
					getAnyTweets(queryData, response, returnResults);
				} else {
					returnResults = JSON.stringify(returnResults);
					response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
					response.end(returnResults);
				}
			} else {
				//The following log returns all the tweets found so that they can be recorded.
				returnResults = JSON.stringify(returnResults);
				response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
				response.end(returnResults);
			}
		}
	});
}

function getJournalistBrief(clientData, response){
	var queryDate = clientData["date"][0];
	var queryTeam1 = clientData["team1"];
	var queryTeam2 = clientData["team2"];
	var returnResults = {}
	DBPediaClient.query(sparqlFootballClubQuery(queryTeam1)).execute(function(error, results){
		var team1ReturnResults = {}
		if(results.results.bindings.length > 0){
			//There are results
			allResults = results.results.bindings;
			team1ReturnResults["club"] = queryTeam1;
			team1ReturnResults["clubName"] = allResults[0]["callret-0"];
			team1ReturnResults["clubAbstract"] = allResults[0].abstract;
			team1ReturnResults["manager"] = allResults[0].manager;
			team1ReturnResults["clubManagerName"] = allResults[0]["callret-6"];
			team1ReturnResults["clubManagerAbstract"] = allResults[0].managerAbstract;
			team1ReturnResults["clubManagerThumbnail"] = allResults[0].managerThumbnail;
			team1ReturnResults["ground"] = allResults[0].ground;
			team1ReturnResults["clubGroundAbstract"] = allResults[0].groundAbstract;
			team1ReturnResults["clubGroundName"] = allResults[0]["callret-8"];
			team1ReturnResults["clubGroundThumbnail"] = allResults[0].groundThumbnail;
			team1ReturnResults["clubGroundLatitude"] = allResults[0].groundLatitude;
			team1ReturnResults["clubGroundLongitude"] = allResults[0].groundLongitude;

			var returnPlayers = [];
			for(var i=0;i<allResults.length;i++){
				var newPlayer = {};
				newPlayer["player"] = allResults[i].players;
				newPlayer["playerName"] = allResults[i]["callret-2"];
				newPlayer["playerDOB"] = allResults[i].playerDateOfBirth;
				newPlayer["playerPosition"] = allResults[i].playerPosition;
				newPlayer["playerPositionLabel"] = allResults[i].playerPositionLabel;
				newPlayer["playerThumbnail"] = allResults[i].playerThumbnail;
				newPlayer["playerBirthPlace"] = allResults[i].playerBirthPlace;
				newPlayer["playerBirthPlaceName"] = allResults[i].playerBirthPlaceName;
				newPlayer["playerBirthPlaceLatitude"] = allResults[i].playerBirthPlaceLatitude;
				newPlayer["playerBirthPlaceLongitude"] = allResults[i].playerBirthPlaceLongitude;

				returnPlayers.push(newPlayer);
			}

			team1ReturnResults["players"] = returnPlayers;

			weather.now([[team1ReturnResults["clubGroundLatitude"].value, team1ReturnResults["clubGroundLongitude"].value]] , function(error, results){
				//console.log(results[0].values);
			});
		} else {
			team1ReturnResults = null;
		}
		returnResults["team1"] = team1ReturnResults;

		DBPediaClient.query(sparqlFootballClubQuery(queryTeam2)).execute(function(error, results){
			var team2ReturnResults = {}
			if(results.results.bindings.length > 0){
				//There are results
				allResults = results.results.bindings;
				team2ReturnResults["club"] = queryTeam2;
				team2ReturnResults["clubName"] = allResults[0]["callret-0"];
				team2ReturnResults["clubAbstract"] = allResults[0].abstract;
				team2ReturnResults["manager"] = allResults[0].manager;
				team2ReturnResults["clubManagerName"] = allResults[0]["callret-6"];
				team2ReturnResults["clubManagerAbstract"] = allResults[0].managerAbstract;
				team2ReturnResults["clubManagerThumbnail"] = allResults[0].managerThumbnail;
				team2ReturnResults["ground"] = allResults[0].ground;
				team2ReturnResults["clubGroundAbstract"] = allResults[0].groundAbstract;
				team2ReturnResults["clubGroundName"] = allResults[0]["callret-8"];
				team2ReturnResults["clubGroundThumbnail"] = allResults[0].groundThumbnail;
				team2ReturnResults["clubGroundLatitude"] = allResults[0].groundLatitude;
				team2ReturnResults["clubGroundLongitude"] = allResults[0].groundLongitude;

				var returnPlayers = [];
				for(var i=0;i<allResults.length;i++){
					var newPlayer = {};
					newPlayer["player"] = allResults[i].players;
					newPlayer["playerName"] = allResults[i]["callret-2"];
					newPlayer["playerDOB"] = allResults[i].playerDateOfBirth;
					newPlayer["playerPosition"] = allResults[i].playerPosition;
					newPlayer["playerPositionLabel"] = allResults[i].playerPositionLabel;
					newPlayer["playerThumbnail"] = allResults[i].playerThumbnail;
					newPlayer["playerBirthPlace"] = allResults[i].playerBirthPlace;
					newPlayer["playerBirthPlaceName"] = allResults[i].playerBirthPlaceName;
					newPlayer["playerBirthPlaceLatitude"] = allResults[i].playerBirthPlaceLatitude;
					newPlayer["playerBirthPlaceLongitude"] = allResults[i].playerBirthPlaceLongitude;

					returnPlayers.push(newPlayer);
				}

				team2ReturnResults["players"] = returnPlayers;
			} else {
				team2ReturnResults = null;
			}
			returnResults["team2"] = team2ReturnResults;
			response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
			response.end(JSON.stringify(returnResults));
		});
	});
}

function getPlayerHistory(clientData, response){
	var player = clientData["player"];
	var playerReturnResults = {};
	DBPediaClient.query(sparqlFootballPlayerQuery(player)).execute(function(error, results){
		if(results.results.bindings.length > 0){
			allResults = results.results.bindings;
			playerReturnResults["playerName"] = allResults[0]["callret-0"];
			playerReturnResults["playerFullname"] = allResults[0]["callret-1"];
			playerReturnResults["playerPosition"] = allResults[0].playerPosition;
			playerReturnResults["playerDOB"] = allResults[0].playerDOB;
			playerReturnResults["playerThumbnail"] = allResults[0].playerThumbnail;
			playerReturnResults["playerBirthPlace"] = allResults[0].playerBirthPlace;
			playerReturnResults["playerPositionLabel"] = allResults[0].playerPositionLabel;
			playerReturnResults["playerPositionComment"] = allResults[0].playerPositionComment;
			playerReturnResults["playerBirthPlaceName"] = allResults[0]["callret-8"];
			playerReturnResults["playerBirthPlaceLatitude"] = allResults[0].playerBirthPlaceLatitude;
			playerReturnResults["playerBirthPlaceLongitude"] = allResults[0].playerBirthPlaceLatitude;
			playerReturnResults["playerAbstract"] = allResults[0].playerAbstract;

			var returnCareerStations = [];
			for(var i=0;i<allResults.length;i++){
				var newCareerStation = {};
				newCareerStation["playerCareerStation"] = allResults[i].playerCareerStation;
				newCareerStation["playerCareerStationTeam"] = allResults[i].playerCareerStationTeam;
				newCareerStation["playerCareerStationYears"] = allResults[i].playerCareerStationYears;
				newCareerStation["playerCareerStationGoals"] = allResults[i].playerCareerStationGoals;
				newCareerStation["playerCareerStationMatches"] = allResults[i].playerCareerStationMatches;
				newCareerStation["playerCareerStationTeamClubName"] = allResults[i].playerCareerStationTeamClubName;
				newCareerStation["playerCareerStationTeamComment"]= allResults[i].playerCareerStationTeamComment;

				returnCareerStations.push(newCareerStation);
			}
			playerReturnResults["playerCareerStations"] = returnCareerStations;

		} else {
			playerReturnResults = null;
		}

		response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
		response.end(JSON.stringify(playerReturnResults));
	});
}

/*
* Intended to be used when shutting down the server and to close any connections that might still exist.
* After an allotted time, the server timesouts and forces the shutdown of the server.
*/
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
	}, 1*1000);
}

function sparqlFootballClubQuery(teamDBPediaPage){
	sparqlQuery = "SELECT MIN((?clubName) as ?clubName)"
	sparqlQuery = sparqlQuery + " ?abstract"
	sparqlQuery = sparqlQuery + " MIN((?playerName) as ?playerName)"
	sparqlQuery = sparqlQuery + " ?playerDateOfBirth"
	sparqlQuery = sparqlQuery + " ?playerThumbnail"
	sparqlQuery = sparqlQuery + " ?playerPositionLabel"
	sparqlQuery = sparqlQuery + " MIN((?managerName) as ?managerName)"
	sparqlQuery = sparqlQuery + " ?managerThumbnail"
	sparqlQuery = sparqlQuery + " MIN((?groundName) as ?groundName)"
	sparqlQuery = sparqlQuery + " ?groundAbstract"
	sparqlQuery = sparqlQuery + " ?groundThumbnail"
	sparqlQuery = sparqlQuery + " ?managerAbstract"
	sparqlQuery = sparqlQuery + " ?players"
	sparqlQuery = sparqlQuery + " ?playerPosition"
	sparqlQuery = sparqlQuery + " ?manager"
	sparqlQuery = sparqlQuery + " ?ground"
	sparqlQuery = sparqlQuery + " ?groundLatitude"
	sparqlQuery = sparqlQuery + " ?groundLongitude"
	sparqlQuery = sparqlQuery + " ?playerBirthPlace"
	sparqlQuery = sparqlQuery + " MIN((?playerBirthPlaceName) as ?playerBirthPlaceName)"
	sparqlQuery = sparqlQuery + " ?playerBirthPlaceLatitude"
	sparqlQuery = sparqlQuery + " ?playerBirthPlaceLongitude"
	sparqlQuery = sparqlQuery + " FROM <http://dbpedia.org> WHERE {"

	sparqlQuery = sparqlQuery + " <" + teamDBPediaPage + "> dbp:clubname ?clubName FILTER langMatches(lang(?clubName),'en')."
	sparqlQuery = sparqlQuery + " <" + teamDBPediaPage + "> dbo:abstract ?abstract FILTER langMatches(lang(?abstract),'en')."
	sparqlQuery = sparqlQuery + " <" + teamDBPediaPage + "> dbp:name ?players."

	sparqlQuery = sparqlQuery + " ?players dbp:name ?playerName FILTER langMatches(lang(?playerName),'en')."
	sparqlQuery = sparqlQuery + " ?players dbp:position ?playerPosition."
	sparqlQuery = sparqlQuery + " ?players dbo:birthDate ?playerDateOfBirth."
	sparqlQuery = sparqlQuery + " ?players dbo:thumbnail ?playerThumbnail."
	sparqlQuery = sparqlQuery + " ?players dbo:birthPlace ?playerBirthPlace."

	sparqlQuery = sparqlQuery + " ?playerBirthPlace rdfs:label ?playerBirthPlaceName FILTER langMatches(lang(?playerBirthPlaceName),'en')."
	sparqlQuery = sparqlQuery + " ?playerBirthPlace geo:lat ?playerBirthPlaceLatitude."
	sparqlQuery = sparqlQuery + " ?playerBirthPlace geo:long ?playerBirthPlaceLongitude."

	sparqlQuery = sparqlQuery + " ?playerPosition rdfs:label ?playerPositionLabel FILTER langMatches(lang(?playerPositionLabel),'en')."

	sparqlQuery = sparqlQuery + " <" + teamDBPediaPage + "> dbp:manager ?manager."
	sparqlQuery = sparqlQuery + " ?manager dbp:name ?managerName FILTER langMatches(lang(?managerName),'en')."
	sparqlQuery = sparqlQuery + " ?manager dbo:abstract ?managerAbstract FILTER langMatches(lang(?managerAbstract),'en')."
	sparqlQuery = sparqlQuery + " ?manager dbo:thumbnail ?managerThumbnail."

	sparqlQuery = sparqlQuery + " <" + teamDBPediaPage + "> dbp:ground ?ground."
	sparqlQuery = sparqlQuery + " ?ground dbp:name ?groundName FILTER langMatches(lang(?groundName),'en')."
	sparqlQuery = sparqlQuery + " ?ground dbo:abstract ?groundAbstract FILTER langMatches(lang(?groundAbstract),'en')."
	sparqlQuery = sparqlQuery + " ?ground dbo:thumbnail ?groundThumbnail."
	sparqlQuery = sparqlQuery + " ?ground geo:lat ?groundLatitude."
	sparqlQuery = sparqlQuery + " ?ground geo:long ?groundLongitude."

	sparqlQuery = sparqlQuery + " }"
	return sparqlQuery
}

function sparqlFootballPlayerQuery(playerDBPediaPage){
	sparqlQuery = "SELECT MIN((?playerName) as ?playerName)"
	sparqlQuery = sparqlQuery + " MIN((?playerFullName) as ?playerFullName)"
	sparqlQuery = sparqlQuery + " ?playerPosition"
	sparqlQuery = sparqlQuery + " ?playerDOB"
	sparqlQuery = sparqlQuery + " ?playerThumbnail"
	sparqlQuery = sparqlQuery + " ?playerBirthPlace"
	sparqlQuery = sparqlQuery + " MIN((?playerPositionLabel) as ?playerPositionLabel)"
	sparqlQuery = sparqlQuery + " MIN((?playerPositionComment) as ?playerPositionComment)"
	sparqlQuery = sparqlQuery + " MIN((?playerBirthPlaceName) as ?playerBirthPlaceName)"
	sparqlQuery = sparqlQuery + " ?playerBirthPlaceLatitude"
	sparqlQuery = sparqlQuery + " ?playerBirthPlaceLongitude"
	sparqlQuery = sparqlQuery + " ?playerAbstract"
	sparqlQuery = sparqlQuery + " ?playerCareerStation"
	sparqlQuery = sparqlQuery + " ?playerCareerStationTeam"
	sparqlQuery = sparqlQuery + " ?playerCareerStationYears"
	sparqlQuery = sparqlQuery + " ?playerCareerStationGoals"
	sparqlQuery = sparqlQuery + " ?playerCareerStationMatches"
	sparqlQuery = sparqlQuery + " MIN((?playerCareerStationTeamClubName) as ?playerCareerStationTeamClubName)"
	sparqlQuery = sparqlQuery + " MIN((?playerCareerStationTeamComment) as ?playerCareerStationTeamComment)"
	sparqlQuery = sparqlQuery + " FROM <http://dbpedia.org> WHERE {"

	sparqlQuery = sparqlQuery + " <" + playerDBPediaPage + "> dbp:name ?playerName FILTER langMatches(lang(?playerName),'en')."
	sparqlQuery = sparqlQuery + " <" + playerDBPediaPage + "> dbp:fullname ?playerFullName FILTER langMatches(lang(?playerFullName),'en')."
	sparqlQuery = sparqlQuery + " <" + playerDBPediaPage + "> dbo:position ?playerPosition."
	sparqlQuery = sparqlQuery + " <" + playerDBPediaPage + "> dbp:dateOfBirth ?playerDOB."
	sparqlQuery = sparqlQuery + " <" + playerDBPediaPage + "> dbo:thumbnail ?playerThumbnail."
	sparqlQuery = sparqlQuery + " <" + playerDBPediaPage + "> dbo:birthPlace ?playerBirthPlace."

	sparqlQuery = sparqlQuery + " ?playerPosition rdfs:label ?playerPositionLabel FILTER langMatches(lang(?playerPositionLabel),'en')."
	sparqlQuery = sparqlQuery + " ?playerPosition rdfs:comment ?playerPositionComment FILTER langMatches(lang(?playerPositionComment),'en')."

	sparqlQuery = sparqlQuery + " ?playerBirthPlace rdfs:label ?playerBirthPlaceName FILTER langMatches(lang(?playerPositionComment),'en')."
	sparqlQuery = sparqlQuery + " ?playerBirthPlace geo:lat ?playerBirthPlaceLatitude."
	sparqlQuery = sparqlQuery + " ?playerBirthPlace geo:long ?playerBirthPlaceLongitude."

	sparqlQuery = sparqlQuery + " <" + playerDBPediaPage + "> dbo:abstract ?playerAbstract FILTER langMatches(lang(?playerAbstract),'en')."

	sparqlQuery = sparqlQuery + " <" + playerDBPediaPage + "> dbo:careerStation ?playerCareerStation."
	sparqlQuery = sparqlQuery + " ?playerCareerStation dbo:team ?playerCareerStationTeam."
	sparqlQuery = sparqlQuery + " ?playerCareerStation dbo:years ?playerCareerStationYears."
	sparqlQuery = sparqlQuery + " ?playerCareerStation dbo:numberOfGoals ?playerCareerStationGoals."
	sparqlQuery = sparqlQuery + " ?playerCareerStation dbo:numberOfMatches ?playerCareerStationMatches."

	sparqlQuery = sparqlQuery + " ?playerCareerStationTeam rdfs:label ?playerCareerStationTeamClubName FILTER langMatches(lang(?playerCareerStationTeamClubName),'en')."
	sparqlQuery = sparqlQuery + " ?playerCareerStationTeam rdfs:comment ?playerCareerStationTeamComment FILTER langMatches(lang(?playerCareerStationTeamComment),'en')."

	sparqlQuery = sparqlQuery + " }"
	return sparqlQuery
}
