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

function handleServerResponse(data){
    populateRetrievedTweetDisplay(data);
    populateTweetStatsDisplay(data);
}

function populateRetrievedTweetDisplay(data){
    var retrieved_tweet_display = $('#retrieved_tweet_display');
    var no_tweets = $('#no_tweets');
    no_tweets.html(data.length);

    for(i=0; i<data.length; i++){
        var container = document.createElement("div");
        var author = document.createElement("a");
        var tweetText = document.createElement("p");
        var createdAt = document.createElement("p");
        var br1 = document.createElement("br");
        var br2 = document.createElement("br");

        var dateArray = data[i].created_at.split(' ');
        var formattedDate = dateArray[3].slice(0,-3) + ' ' + dateArray[0] + ' ' + dateArray[2] + ' ' + dateArray[1] + ' ' + dateArray[5];
        
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

        }
    }

    retrieved_tweet_display.css("display", "block");
}

function populateTweetStatsDisplay(data){
    var tweet_stats_display = $('#tweet_stats_display');
    tweet_stats_display.css("display", "block");

    tweetWordsCount = {};

    for(i=0; i<data.length; i++){
        //iterate through all of the tweets and strip from them hashes, urls and mentions etc
        var tweetWords = [];
        if(data[i].retweeted_status != null){
            tweetWords = stripToWords(data[i].retweeted_status);
        } else {
            tweetWords = stripToWords(data[i]);
        }

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
    }

    //sort the array by count
    wordsSorted = Object.keys(tweetWordsCount).sort(function(a,b){return tweetWordsCount[b]-tweetWordsCount[a]}).slice(0,20);
    
    displayWords(wordsSorted, tweetWordsCount);
}

function displayWords(wordsSorted, tweetWordsCount){
    for(i=0; i< wordsSorted.length; i++){
        var container = document.createElement("div")
        $('#top_words').append(container);

        wordText = wordsSorted[i] + ": " + tweetWordsCount[wordsSorted[i]];

        $(container).text(wordText);

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






