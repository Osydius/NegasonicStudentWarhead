// SEND DATA TO SERVER-----------------------------------------------------------------------------------------------------------------
function sendALLAjaxQuery(url, data) {
        console.log('sendAjaxQuery ' + url);
        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: url+'getAllTweets.html',
            data: data,
            success: function (data) {
                handleServerResponse(data);
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
               
            }
        });
    }

function sendANYAjaxQuery(url, data) {
    $.ajax({
        dataType: 'json',
        data: data,
        type: 'POST',
        url: url + 'getAnyTweets.html',
        success: function (data, status, xhr) {
            handleServerResponse(data);
        },
            error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
});
}

$.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                if(this.name === "players" || "hashtags" || "keywords"){

                    var players = this.value
                    var jsonfied = players.replace( /,$/, "" ).split(",");
                    o[this.name] = jsonfied;
                       
                } else {
                    o[this.name] = this.value || '';
                }
            }
        });
        return o;
    };

    function sendData() {
        var form = $('#myForm')

        var id = event.target.id;
        if(id == "sendALLButton"){
            sendALLAjaxQuery('http://localhost:3000/', JSON.stringify($('form').serializeObject()));
        } else if (id == "sendANYButton"){
            sendANYAjaxQuery('http://localhost:3000/', JSON.stringify($('form').serializeObject()));
        }

        
        return false;
    }


    var sendALLButton = document.getElementById('sendALLButton');
    sendALLButton.onclick = sendData;

    var sendANYButton = document.getElementById('sendANYButton');
    sendANYButton.onclick = sendData;



// HANDLE RESPONSE FROM SERVER ---------------------------------------------------------------------------------------------------

function handleServerResponse(data){
    var retrieved_tweet_display = $('#retrieved_tweet_display');
    var no_tweets = $('#no_tweets');
    no_tweets.html(data.length);
    var locatedTweetCounter = 0;

    //objects to collect information whilst parsing for the stats display
    var userObject = {};
    var tweetWordsCount = {};

    console.log(data);

    //iterate through all retrieved tweets
    for(i=0; i<data.length; i++){
        var container = document.createElement("div");
        var author = document.createElement("a");
        var tweetText = document.createElement("p");
        var createdAt = document.createElement("p");
        var br1 = document.createElement("br");
        var br2 = document.createElement("br");

        var dateArray = data[i].created_at.split(' ');
        var formattedDate = dateArray[3].slice(0,-3) + ' ' + dateArray[0] + ' ' + dateArray[2] + ' ' + dateArray[1] + ' ' + dateArray[5];

        //console.log(data[i].coordinates)
        
        if (data[i].retweeted_status != null){
            var originalAuthor = document.createElement("a");
            var br3 = document.createElement("br");

            $('#tweets').append(container);
            container.appendChild(originalAuthor);
            container.appendChild(br3);
            container.appendChild(author);
            container.appendChild(br1);
            container.appendChild(tweetText);
            container.appendChild(br2);
            container.appendChild(createdAt);

            retweetData = data[i].retweeted_status;
            
            var tweetDisplay = linkifyTweet(retweetData);

            container.className = "retweet";
            $(originalAuthor).attr('href', "http://www.twitter.com/"+retweetData.user.screen_name);
            $(originalAuthor).text(retweetData.user.name + ' @' + retweetData.user.screen_name);
            $(author).attr('href', "http://www.twitter.com/"+data[i].user.screen_name);
            $(author).text('RT:  @' + data[i].user.screen_name);
            $(tweetText).html(tweetDisplay);
            $(createdAt).text(formattedDate);

            var rtAuthorStat = data[i].user;
            var authorStat = retweetData.user;
            var tweetWordsStat = stripToWords(data[i]); //this will be used for both top 20 words and active users

        } else {

            $('#tweets').append(container);
            container.appendChild(author);
            container.appendChild(br1);
            container.appendChild(tweetText);
            container.appendChild(br2);
            container.appendChild(createdAt);

            var tweetDisplay = linkifyTweet(data[i]);

            container.className = "tweet";
            $(author).attr('href', "http://www.twitter.com/"+data[i].user.screen_name);
            $(author).text(data[i].user.name + ' @' + data[i].user.screen_name);
            $(tweetText).html(tweetDisplay);
            $(createdAt).text(formattedDate);

            //for stats make a note of the author and words in tweet
            var rtAuthorStat = null;
            var authorStat = data[i].user;
            var tweetWordsStat = stripToWords(data[i]);  //this will be used for both top 20 words and active users

        }

        //Stats
        //TOP 20 WORDS
        tweetWordsCount = getTotalWordCounts(tweetWordsCount, getWordsCounts(tweetWordsStat));

        //10 ACTIVE USERS
        userObject = generateUserStats(userObject, rtAuthorStat, authorStat, tweetWordsStat);

        if(data[i].coordinates != null){
            generateMapMarker(data[i].coordinates, tweetDisplay);
            locatedTweetCounter++;
        }

    }

    //set the number of located tweets string
    $('#no_located_tweets').html(locatedTweetCounter);

    //display stats div
    var tweet_stats_display = $('#tweet_stats_display');
    tweet_stats_display.css("display", "block");

    //display the 20 most used words
    displayTopWords(tweetWordsCount);

    //display the most active 10 users
    displayActiveUsers(userObject);

    //display the tweet in display window
    retrieved_tweet_display.css("display", "block");
}

function generateUserStats(userObject, rtAuthorStat, authorStat, tweetWordsStat){
    //if they exist add the rtAuthor to the user object
        if(rtAuthorStat != null){
            //check to see if this author has already been listed in the object
            if(!userObject.hasOwnProperty(rtAuthorStat.screen_name)) {
                var profileImageUrl = rtAuthorStat.profile_image_url_https;
                var name = String(rtAuthorStat.screen_name);
                userObject[name] = {tweetCount: 1, profileImage: profileImageUrl, words:{}};
            } else {
                var name = String(rtAuthorStat.screen_name);
                var newCount = userObject[name].tweetCount + 1;
                userObject[name].tweetCount = newCount;
            }

        }
        
        //add the original author to the user object
        //add as the value of the original author the word count list for that author
        //add the word count for that tweet to a separate word count object
        if(!userObject.hasOwnProperty(authorStat.screen_name)){
            var profileImageUrl = authorStat.profile_image_url_https;
            var name = String(authorStat.screen_name);
            var counts = getWordsCounts(tweetWordsStat);
            userObject[name] = {tweetCount: 1, profileImage: profileImageUrl, words: counts};
        } else {
            //increment the tweet count for that author
            var name = String(authorStat.screen_name);
            var newCount = userObject[name].tweetCount + 1;
            userObject[name].tweetCount = newCount;

            //combine counts for this tweet with existing accounts
            var fullCount = getTotalWordCounts(userObject[name].words, getWordsCounts(tweetWordsStat));
            userObject[name].words = fullCount;
        }

    return userObject;
}


//takes an array of words and returns an object of each word along
//with its count
function getWordsCounts(tweetWords){
    tweetWordsCount = {};
    tweetWords = tweetWords.filter(Boolean); //remove "" from array

        //put each word into an array with its count
        for(j=0; j<tweetWords.length; j++){
            //if word doesn't exist in array then add it with its count
            if(tweetWordsCount.hasOwnProperty(tweetWords[j])){
                var word = tweetWords[j];
                tweetWordsCount[word]++;
            } else {
                tweetWordsCount[tweetWords[j]] = 1;
            }
        }
    return tweetWordsCount;
}

//takes an existing word count object and a new one and merges them together
function getTotalWordCounts(existingCounts, newCounts){
    for(var key in newCounts){
        if(existingCounts.hasOwnProperty(key)){
            existingCounts[key] = existingCounts[key] + newCounts[key];
        } else {
            keyString = String(key);
            existingCounts[keyString] = 1;
        }
    }

    return existingCounts;
}

//takes an object of all the words and their counts and displays the top 20 words
//on the stats display
function displayTopWords(tweetWordsCount){
    var top20Array = Object.keys(tweetWordsCount).sort(function(a,b){return tweetWordsCount[b]-tweetWordsCount[a]}).slice(0,20);

    for(i=0; i<top20Array.length; i++){
        var container = document.createElement("div")
        $('#top_words').append(container);

        var wordText = top20Array[i] + ": " + tweetWordsCount[top20Array[i]];

        $(container).text(wordText);
    }
}

//takes a user object and iterates through this to display the 10 most active users
//along with their profile picutres, and frequent words on the stats display
function displayActiveUsers(userObject){
    var top10Array = Object.keys(userObject).sort(function(a,b){return userObject[b].tweetCount-userObject[a].tweetCount}).slice(0,10);

    for(i=0; i<top10Array.length; i++){
        var container = document.createElement("div");
        var profileImg = document.createElement("img");
        var title = document.createElement("a");
        var noTweets = document.createElement("p");
        var br = document.createElement("br");
        var body = document.createElement("p");
        $('#top_users').append(container);

        //$(container).text(string);      
        container.appendChild(profileImg);
        container.appendChild(title);
        container.appendChild(noTweets);
        container.appendChild(br);
        container.appendChild(body);  

        container.className = "userDisplay";
        var userName = top10Array[i];
        $(profileImg).attr('src', userObject[userName].profileImage);
        $(title).attr('href', "http://www.twitter.com/"+userName);
        $(title).text('@' + userName);
        $(noTweets).text(' - ' + userObject[userName].tweetCount + ' tweets - most frequent words: ');

        
        var topWords = Object.keys(userObject[userName].words).sort(function(a,b){return userObject[userName].words[b]-userObject[userName].words[a]}).slice(0,4);
        var topWordsString = "";
        for(j=0; j<topWords.length; j++){
            var word = topWords[j];
            topWordsString = topWordsString.concat(word+ "("+userObject[userName].words[word]+") ");
        }

        $(body).text(topWordsString);
    }
}

//Removes all hashtags, urls, media links, mentions, punctuation
//and different cases from a tweet and returns this stripped version
function stripToWords(tweetData){
    //remove hashes
    var hashtagArray = tweetData.entities.hashtags;
    var mentionsArray = tweetData.entities.user_mentions;
    var urlsArray = tweetData.entities.urls;
    var mediaArray = tweetData.entities.media;
    var masterArray = [hashtagArray, mentionsArray, urlsArray];
    var strippedTweet = tweetData.text;

    if(mediaArray != null){
        masterArray.push(mediaArray);
    }

    for(j=0; j<masterArray.length; j++){
        array = masterArray[j];
        for(k=0; k<array.length; k++){
            indicesArray = array[k].indices;
            var match = tweetData.text.substring(indicesArray[0], indicesArray[1]);
            strippedTweet = strippedTweet.replace(match, "");
        }
    }

    strippedTweet = strippedTweet.replace(/[^\w\s]/gi, '') //remove punctuation
                                .replace(/\W*\b\w{1,3}\b/g, "") //remove short words (length less than 3)
                                .replace(/\s+/g, " "); //condense large whitespaces created to a single white space
    strippedTweet = strippedTweet.toLowerCase();
    return strippedTweet.split(" ");
}

//Gets tweet text and for each hash, mention, url or media makes the link work or in the case of media
//gets the media to display
function linkifyTweet(tweetData){
    var tweetText = tweetData.text;

    //handle hashtags first
    var hashtagArray = tweetData.entities.hashtags;
    //iterate through the hashtag entities array and get the location of each hashtag
    if(hashtagArray.length > 0){
        for(j=0; j<hashtagArray.length; j++){
        
            indicesArray = hashtagArray[j].indices;
            var hashtag = tweetData.text.substring(indicesArray[0], indicesArray[1]);
            tweetText = tweetText.replace(hashtag, "<a href=\" https://twitter.com/hashtag/" +hashtag.substring(1)+ "?src=hash\">"+hashtag+"</a>");
        }
    }

    //handle mentions
    var mentionsArray = tweetData.entities.user_mentions;
    if(mentionsArray.length > 0){
        for(j=0; j<mentionsArray.length; j++){
            indicesArray = mentionsArray[j].indices;
            var mention = tweetData.text.substring(indicesArray[0], indicesArray[1]);
            tweetText = tweetText.replace(mention, "<a href=\"https://twitter.com/"+ mention.substring(1) +" \">"+mention+"</a>");
        }
    }

    //handle urls
    var urlsArray = tweetData.entities.urls;
    if(urlsArray.length > 0){
        for(j=0; j<urlsArray.length; j++){
            indicesArray = urlsArray[j].indices;
            var url = tweetData.text.substring(indicesArray[0], indicesArray[1]);
            tweetText = tweetText.replace(url, "<a href=\""+url+"\">"+urlsArray[j].display_url+"</a>"); //should set the title attribute of a to extened_url so this is displayed when the user hovers on the link
        }
    }

    //handle media, the media array only exists in entities if media is in tweet
    var mediaArray = tweetData.entities.media;
    if(mediaArray != null){
        if(mediaArray.length > 0){
            for(j=0; j<mediaArray.length; j++){
                indicesArray = mediaArray[j].indices;
                var media = tweetData.text.substring(indicesArray[0], indicesArray[1]);
                tweetText = tweetText.replace(media, "<br><img src="+mediaArray[j].media_url_https+":small"+">");

            }
        }
    }
    return tweetText;
}

// GOOGLE MAPS STUFF ------------------------------------------------------------------------------------------------------------------------------
        //Global variable for the map
        var myLatlng = new google.maps.LatLng(54.504682, -0.436730);
        var mapOptions = {
                zoom: 6,
                center: myLatlng}
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);





        function generateMapMarker(coordinatesObject, tweetDispley){
            var lat = coordinatesObject.coordinates[1];
            var long = coordinatesObject.coordinates[0];
            var myLatlng = new google.maps.LatLng(lat, long);
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title:"tweet"});
            var infowindow = new google.maps.InfoWindow({
                content: tweetDispley,
                maxWidth:200 });
              google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);            });
        }

    






