/*
*
* Authors: James Hall and Nicola Willis
* Team: NegasonicStudentWarhead
*
*/

var protocol = require('http');
var static = require('node-static');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var Twit = require('twit');
var config = require('./config.js');

var twitterClient = new Twit(config.twitter);
 
var fileServer = new (static.Server)();
var portNo = config.portNo;

var serverApp = protocol.createServer(function (request, response) {
	var pathname = url.parse(request.url).pathname;

	if(request.method == 'GET'){
		if(pathname != "" && pathname != null && pathname != "/"){
			console.log("getting methods");
		} else {
			callError(request, response);
		}
	} else if (request.method == 'POST'){
		if(pathname != "" && pathname != null && pathname != "/"){
			var body = '';
      request.on('data', function (data) {
          body += data;
          if (body.length > 1e6) {
              response.writeHead(413, {'Content-Type': 'text/plain'}).end();
              request.connection.destroy();
          }
      });
      request.on('end', function () {
      	if(pathname == '/getAllTweets.html'){
					getAllTweets(body, response);
				} else if(pathname == '/getAnyTweets.html'){
					getAnyTweets(body);
				}
      });
		} else {
			callError(request, response);
		}
	} else {
		callError(request, response);
	}
}).listen(config.portNo);

function callError(request, response){
	fileServer.serve(request, response, function (error, result) {
    if (error != null) {
        console.error('Error serving %s - %s', request.url, error.message);
        if (error.status === 404 || error.status === 500) {
            fileServer.serveFile(util.format('error_pages/%d.html', error.status), error.status, {}, request, response);
        } else {
            response.writeHead(error.status, error.headers);
            response.end();
        }
    }
	});
}

function getAllTweets(clientData, response){
	console.log(clientData)
	
	var allData = JSON.parse(clientData);

	var twitterQuery = '';
	var queryTeam = allData.team;
	var queryPlayers = allData.players;
	var queryHashtags = allData.hashtags;
	var queryKeywords = allData.keywords;

	twitterQuery = twitterQuery + ' from:' + queryTeam;
	if(queryPlayers !== undefined && queryHashtags !== undefined && queryKeywords !== undefined){
		queryPlayers.foreach(function(player){
			twitterQuery = twitterQuery + ' from:' + player;
		});

		queryHashtags.foreach(function(hashtag){
			twitterQuery = twitterQuery + ' #' + hashtag;
		});

		queryPlayers.each(function(keyword){
			twitterQuery = twitterQuery + player;
		});
	}

	twitterClient.get('search/tweets', { q: twitterQuery }, function(err, data, result) {

    tweets = JSON.stringify(data.statuses);

    response.writeHead(200, {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'});
    response.end(tweets);

  }); 
}

function getAnyTweets(clientData){
	console.log(clientData)
}