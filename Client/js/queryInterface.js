//

// Authors: James Hall and Nicola Willis
// Team: NegasonicStudentWarhead
//

// Section 1: Validate and send data to server-----------------------------------------------------------------------------------------------------------------
/**
 * Sends an Ajax call that ANDs all the query terms together
 * @param {String} url - base url to the server
 * @param {Object} data - the terms that were entered into the form
 */
function sendALLAjaxQuery(url, data) {
        $('.swirly').css('display','block');
        $.ajax({
            dataType: 'json',
            contentType: "application/json",
            type: 'POST',
            url: url+'getAllTweets.html',
            data: data,
            success: function (data) {
                $('.swirly').css('display','none');
                handleServerResponse(data);
            },
            error: function (xhr, status, error) {
                $('.swirly').css('display','none');
                console.log('Error: ' + error.message);
               
            }
        });
    }

/**
 * Sends an Ajax call that ORs all the query terms together
 * @param {String} url - base url to the server
 * @param {Object} data - the terms that were entered into the form
 */
function sendANYAjaxQuery(url, data) {
    $('.swirly').css('display','block');
    $.ajax({
        dataType: 'json',
        contentType: "application/json",
        data: data,
        type: 'POST',
        url: url + 'getAnyTweets.html',
        success: function (data, status, xhr) {
            $('.swirly').css('display','none');
            handleServerResponse(data);
        },
            error: function (xhr, status, error) {
                $('.swirly').css('display','none');
            console.log('Error: ' + error.message);
        }
});
}

/**
 * Iterates through the terms entered in the form and packages them into an object
 * that contains all of the fields split into separate terms where appropriate. Then
 * kickstarts the validation process.
 */
$.fn.serializeObject = function (eventId) {
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
        console.log(o)
        checkSomethingEntered(o, eventId);
    };

    /**
    * Called when either of the form buttons are clicked, collects the id of the button
    * that triggered the call and hands control over to serializeObject()
    */
    function buttonClick() {
        var form = $('#myForm');
        
        var id = event.target.id;
        JSON.stringify($('form').serializeObject(id));

        return false;
    }

    /**
    * Checks that at least some input has been provided in one of the fields. If not display an
    * alert box informing the user that they must enter information, if it does then start the 
    * validation process.
    * @param {Object} userInput - the input that the user has entered into the form
    * @param {String} eventId - the id of the button that was pressed
    */
    function checkSomethingEntered(userInput, eventId){
        var filteredPlayers = userInput.players
        filteredPlayers = filteredPlayers.filter(function(n){ return n.trim() != ""});

        if ( JSON.stringify(userInput.team).length <= 4 && filteredPlayers.length == 0 &&
            JSON.stringify(userInput.hashtags).length <= 4 && JSON.stringify(userInput.keywords).length <= 4){
            //user hasn't entered anything
            alert("You must provide input to at least one field before you can perform a search");
            return false;
        } else {
            //at least one field contains input so begin the validation process
            validateTeamInput(userInput, eventId);
        }
    }

    /**
    * Takes serialized input data and uses this to make a call to check that the team entered 
    * exists in the database if a team was entered, otherwise, validation is progressed
    * to the rest of the input fields.
    * @param {Object} userInput - the input that the user has entered into the form
    * @param {String} eventId - the id of the button that was pressed
    */
    function validateTeamInput(userInput, eventId) {
        //make a call to retrieve the relevant data from database if it exists.
        if (JSON.stringify(userInput.team).length <= 4){
            //a team wasn't entered so move onto the next stage of validation
            validatePlayerInput(userInput,eventId);
        } else {
            //a team has been entered so first check that this team exists in the database

            fetchClubTwitterHandle(userInput, JSON.stringify(userInput.team),eventId);
        }
        return false;
    }

    /**
    * Takes serialized input data and uses this to make a call to check that the players entered 
    * all exist in the database if any players were entered, otherwise, validation is progressed
    * to the rest of the input fields.
    * @param {Object} userInput - the input that the user has entered into the form
    * @param {String} eventId - the id of the button that was pressed
    */
    function validatePlayerInput(userInput, eventId){
        //purge the input of any blank entries
        var filteredPlayers = userInput.players
        filteredPlayers = filteredPlayers.filter(function(n){ return n.trim() != ""});

        if(filteredPlayers.length > 0){
            //players have been entered so check they exist in the database
            fetchPlayersTwitterHandle(userInput, JSON.stringify(filteredPlayers), eventId);
        } else {
            //no players have been entered so move onto the next stage of validation
            validateHashtagInput(userInput,eventId);
        }       
        return false;
    }

    /**
    * Checks that the entered hashtags meets twitters hashtag rules. If they do then
    * carry out the API call that will retrieve the tweets as all validation has 
    * passed.
    * @param {Object} userInput - the input that the user has entered into the form
    * @param {String} eventId - the id of the button that was pressed
    */
    function validateHashtagInput(userInput, eventId){
        invalidHashtagRules = validateHashtags(userInput.hashtags);
        if(invalidHashtagRules.length > 0){
            alert("Hashtag validation has failed\nHashtags must not:"+invalidHashtagRules);
            return false;
        }

        //if this stage has been reached validations passed so run the ajax query
        if(eventId == "sendALLButton"){
            sendALLAjaxQuery('http://localhost:3000/', JSON.stringify(userInput));
        } else if (eventId == "sendANYButton"){
            sendANYAjaxQuery('http://localhost:3000/', JSON.stringify(userInput));
        }
    }

    /**
    * Sends an AJAX call that attempts to retrieve the relevant twitter handle for the entered
    * team if it exists.
    * @param {Object} userInput - the input that the user has entered into the form
    * @param {Array} data - the data collected from the database, will either be empty or contain handle
    * @param {String} eventId - the id of the button that was pressed
    */
    function fetchClubTwitterHandle(userInput, data,eventId){
        $.ajax({
            dataType: 'json',
            contentType: "application/json",
            type: 'POST',
            url: 'http://localhost:3000/findClubTwitterHandle.html',
            data: data,
            success: function (data) {
                if(data.length == 0){
                    //the team entered has not been recognised in the database
                    alert("Team validation has failed\nA team must be chosen from the options available");
                    return false;
                } else {
                    validatePlayerInput(userInput,eventId);
                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            }
        });
    }

    /**
    * Sends an AJAX call that attempts to retrieve the relevant twitter handle for the entered
    * players if they exist.
    * @param {Object} userInput - the input that the user has entered into the form
    * @param {Array} data - the data collected from the database, will either be empty or contain handle
    * @param {String} eventId - the id of the button that was pressed
    */
    function fetchPlayersTwitterHandle(userInput, data,eventId){
        $.ajax({
            dataType: 'json',
            contentType: "application/json",
            type: 'POST',
            url: 'http://localhost:3000/findPlayersTwitterHandle.html',
            data: data,
            success: function (data) {
                var filteredPlayers = userInput.players
                filteredPlayers = filteredPlayers.filter(function(n){ return n.trim() != ""});
                if(data.length != filteredPlayers.length){
                    //at least one player was not recognised in the database
                    alert("Player validation has failed\nEach player entered must be chosen from the options available");
                    return false;
                } else {
                    validateHashtagInput(userInput,eventId);

                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            }
        });
    }

    /**
    * Takes an array of all the hashtags that the user has entered. Checks that these meet validation rules:
    * no spaces, no special characters, doesn't start with a number, doesn't contain a number only.
    * @param {Array} hashtagArray - the hashtags the user has entered into the search
    */
    function validateHashtags(hashtagArray){
            var invalidHashtagRules = [];
            //rules for a valid hashtag:
            var noSpaces = "- contain spaces";
            var specialCharacters = "- contain special characters";
            var startNoOrNoOnly = "- start with a number or be only a number";
            
            for(var i = 0; i<hashtagArray.length; i++){
                //for 1 make sure no spaces/not empty
                if(hashtagArray[i].indexOf(' ') !== -1){
                    //validation fail
                    invalidHashtagRules.push(noSpaces);  
                }

                //for 2 make sure no special characters
                if(/[-!$%^&*()_+|~=`\\#{}\[\]:";'<>?,.\/]/.test(hashtagArray[i])){
                    //validation fail
                    invalidHashtagRules.push(specialCharacters);
                }

                //for 3 make sure that it doesn't start with a number
                if(/^[0-9]/.test(hashtagArray[i])){
                    //vaildation fail
                    invalidHashtagRules.push(startNoOrNoOnly);
                }
            }
            //remove duplicates
            invalidHashtagRules = invalidHashtagRules.filter( function( item, index, inputArray ) {
               return inputArray.indexOf(item) == index;
            });

            var output = "";
            for(var i=0; i<invalidHashtagRules.length; i++){
                output += "\n"+invalidHashtagRules[i]
            }
            return output;
    }

    //Set the onclick events for the buttons as being the buttonClick function
    var sendALLButton = document.getElementById('sendALLButton');
    sendALLButton.onclick = buttonClick;

    var sendANYButton = document.getElementById('sendANYButton');
    sendANYButton.onclick = buttonClick;


// Section 2: Handle the response that is sent back from the server to get retrieved tweets and stats ---------------------------------------------------------------------------------------------------

/**
 * Iterates through all of the tweets that were retrieved. Checks whether the tweet is a 
 * retweet and appends the appropriate elements to the html page accordingly. During iteration
 * the appropriate data needed to create the stats displays is collected. After iteration stats
 * and map displays are created.
 * @param {Object} data - the tweets that have been retrieved by the server
 */
function handleServerResponse(data){
    $('#no_tweets').html(data.length);

    //remove any old tweets
    $('.tweettile').remove();
    
    //objects to collect information for the stats display whilst parsing
    var userObject = {};
    var tweetWordsCount = {};
    var locatedTweetCounter = 0;
    var locatedTweets = [];

    //iterate through all retrieved tweets
    for(i=0; i<data.length; i++){
        //create all the elements that will be required for this tweet regardless of whether
        //it is a retweet
        var container = document.createElement("div");
        var innerContainer = document.createElement("div");
        var profileImg = document.createElement("img");
        var author = document.createElement("a");
        var tweetText = document.createElement("p");
        var createdAt = document.createElement("p");
        var br1 = document.createElement("br");
        var br2 = document.createElement("br");

        var dateArray = data[i].created_at.split(' ');
        var formattedDate = dateArray[3].slice(0,-3) + ' ' + dateArray[0] + ' ' + dateArray[2] + ' ' + dateArray[1] + ' ' + dateArray[5];
        
        //determine whether or not the tweet is a retweet
        if (data[i].retweeted_status != null){
            var originalAuthor = document.createElement("a");
            var br3 = document.createElement("br");

            $('#tweets').append(container);

            container.appendChild(profileImg);
            container.appendChild(innerContainer);
            innerContainer.appendChild(originalAuthor);
            innerContainer.appendChild(br3);
            innerContainer.appendChild(author);
            innerContainer.appendChild(br1);
            innerContainer.appendChild(tweetText);
            innerContainer.appendChild(br2);
            innerContainer.appendChild(createdAt);

            retweetData = data[i].retweeted_status;
            
            var tweetDisplay = linkifyTweet(retweetData);

            container.className = "retweet";
            $(originalAuthor).attr('href', "http://www.twitter.com/"+retweetData.user.screen_name);
            $(originalAuthor).text(retweetData.user.name + ' @' + retweetData.user.screen_name);
            $(author).attr('href', "http://www.twitter.com/"+data[i].user.screen_name);
            $(author).text('RT:  @' + data[i].user.screen_name);
            $(tweetText).html(tweetDisplay);
            $(createdAt).text(formattedDate);
            $(container).attr('class', 'tweettile');
            $(profileImg).attr('src', data[i].retweeted_status.user.profile_image_url_https);
            $(profileImg).attr('style','float:left;');
            $(innerContainer).attr('style', 'margin-left: 58px;');

            //save the appropriate data for the stats
            var rtAuthorStat = data[i].user;
            var authorStat = retweetData.user;
            var tweetWordsStat = stripToWords(data[i]); //this will be used for both top 20 words and active users

        } else {
            //not a retweet

            $('#tweets').append(container);
            container.appendChild(profileImg);
            container.appendChild(innerContainer);
            innerContainer.appendChild(author);
            innerContainer.appendChild(br1);
            innerContainer.appendChild(tweetText);
            innerContainer.appendChild(br2);
            innerContainer.appendChild(createdAt);

            var tweetDisplay = linkifyTweet(data[i]);

            container.className = "tweet";
            $(author).attr('href', "http://www.twitter.com/"+data[i].user.screen_name);
            $(author).text(data[i].user.name + ' @' + data[i].user.screen_name);
            $(tweetText).html(tweetDisplay);
            $(createdAt).text(formattedDate);
            $(container).attr('class', 'tweettile');
            $(profileImg).attr('src', data[i].user.profile_image_url_https);
            $(profileImg).attr('style','float:left;');
            $(innerContainer).attr('style', 'margin-left: 58px;');

            //save the appropriate data for the stats
            var rtAuthorStat = null;
            var authorStat = data[i].user;
            var tweetWordsStat = stripToWords(data[i]);  //this will be used for both top 20 words and active users

        }

        //Stats
        //Count the word frequencies for the top 20 words
        tweetWordsCount = getTotalWordCounts(tweetWordsCount, getWordsCounts(tweetWordsStat));
        //Calculate user stats for the top 10 users
        userObject = generateUserStats(userObject, rtAuthorStat, authorStat, tweetWordsStat);
        //If the tweet was geolocated, save it to a geolocated tweet list
        if(data[i].coordinates != null){
            locatedTweets.push(data[i]);
            locatedTweetCounter++;
        }
    }

    //set the number of located tweets string
    $('#no_located_tweets').html(locatedTweetCounter);
    //set up the map
    $('#geo_located_display').css("display", "block");
    initializeMap(locatedTweets);
    

    //display stats div
    $('#tweet_stats_display').css("display", "block");

    //display the 20 most used words
    displayTopWords(tweetWordsCount);

    //display the most active 10 users
    displayActiveUsers(userObject);

    //display the tweet in display window
    $('#tweets_display').css("display", "block");
}

/**
 * Called for each retrieved tweet. Takes a userObject and information about the rt author/author as well as 
 * the words used in the tweet. Checks to see if this author has written a tweet before and if so incremements 
 * the count for the number of tweets by that author and merges the word counts for the new tweet with the existing word
 * counts for that auther. Else creates a new entry in the userObject for the new author.
 * @param {Object} userObject - holds for each user, their name, the number of tweets that they have written, and words they 
 *                              have written with their counts
 * @param {Object} rtAuthorStat - holds all the information about the retweeter - null if it wasn't retweeted
 * @param {Object} authorStat - holds all the information about the original author
 * @param {Array} tweetWordsStat - an array of all the words used in the tweet stripped of punctuation etc.
 * @return {Object} userObject - an updated objection that holds each user, the number of tweets they have written, and
 *                               the number of times they have written each word
 */
function generateUserStats(userObject, rtAuthorStat, authorStat, tweetWordsStat){
    //if a tweet is retweeted, add the retweeter to the user object but not the words
    //in the tweet as these were written by the original author. It was decided this 
    //behaviour would be best because a retweeter is an 'active' user.

    //if they exist add the rtAuthor to the user object
    if(rtAuthorStat != null){
        //check to see if this author has already been listed in the object
        if(!userObject.hasOwnProperty(rtAuthorStat.screen_name)) {
            //if not create a new entry for that user
            var profileImageUrl = rtAuthorStat.profile_image_url_https;
            var name = String(rtAuthorStat.screen_name);
            userObject[name] = {tweetCount: 1, profileImage: profileImageUrl, words:{}};
        } else {
            //else add to the existing user
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

/**
 * Takes an array of words and returns an object containing each word with a count of the number of times it appeared
 * in the array.
 * @param {Array} tweetWords - an array that contains words - there may be repititions
 * @return {Object} tweetWordsCount - each word from tweetWords is listed once, alongside the number of times it 
 *                                    appeared in the original array
 */
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

/**
* Takes an two objects that match words with their counts and merges them together.
* @param {Object} existingCounts - words associated with counts
* @param {Object} newCounts - words associated with counts
* @return {Object} existingCounts - the existingCounts object with all of the words and counts added from the 
*                                   new counts object
*/
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

/**
* Takes an object of all the words and their counts and displays the top 20 words
* on the stats display of the page.
* @param {Object} tweetWordsCount - contains each word used in the retrieved tweeets along with 
*                                   a count of the times that it appeared
*/
function displayTopWords(tweetWordsCount){
    //sort the object in order of highest count first and take the top 20 values
    var top20Array = Object.keys(tweetWordsCount).sort(function(a,b){return tweetWordsCount[b]-tweetWordsCount[a]}).slice(0,20);
    $('.top20wordsdisplay').remove();

    //for each element in the top 20 words display this on the page
    for(i=0; i<top20Array.length; i++){
        var container = document.createElement("div")
        
        $('#top_words').append(container);
        $(container).attr('class', 'top20wordsdisplay');
        //give the text the appropriate class so that it can be displayed with the correct color
        if(i==0||i==1||i==2){
            //one of the top 3 words so will have special display properties
            $(container).attr('class', 'place'+i+' top20wordsdisplay');
        }

        var wordText = top20Array[i] + ": " + tweetWordsCount[top20Array[i]];
        $(container).text(wordText);    
    }
}

/**
* Takes an object which details each user along with the number of tweets they have written and the words they have used
* and displays the 10 most active users along with their profile pictures, and most frequent words on the stats display.
* @param {Object} userObject - holds for each user, their name and profile picture url, the number of tweets they have
*                              written/retweeted and the words they have used
*/
function displayActiveUsers(userObject){
    //sort the object in order of the most tweets first and take the top 10
    var top10Array = Object.keys(userObject).sort(function(a,b){return userObject[b].tweetCount-userObject[a].tweetCount}).slice(0,10);
    $('.usertile').remove();

    //for each element in the top 10 array display it on the stats page
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
        $(container).attr('class', 'usertile');
        $(profileImg).attr('src', userObject[userName].profileImage);
        $(profileImg).attr('style','float:left;');
        $(title).attr('href', "http://www.twitter.com/"+userName);
        $(title).text('@' + userName);
        
        $(noTweets).text(' - ' + userObject[userName].tweetCount + ' tweets - most frequent words: ');

        //if it is 1st, 2nd or 3rd add special class for gold/silver/bronze
        if(i==0||i==1||i==2){
            $(container).attr('class', 'place'+i + ' usertile');
        }

        var topWords = Object.keys(userObject[userName].words).sort(function(a,b){return userObject[userName].words[b]-userObject[userName].words[a]}).slice(0,4);
        var topWordsString = "";
        for(j=0; j<topWords.length; j++){
            var word = topWords[j];
            topWordsString = topWordsString.concat(word+ "("+userObject[userName].words[word]+") ");
        }

        $(body).text(topWordsString);
    }
}

/**
* Used to get the raw words in a tweet. Removes all hashtags, urls, media links, mentions, 
* punctuation and different cases from a tweet returning the stripped version.
* @param {Object} tweetData - all of the information about a tweet
* @return {Array} - an array containing only the words from the tweetData
*/
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

/**
* Given the information about a tweet, makes sure that each hash, mention, url or media displays or has an
* active link.
* @param {Object} tweetData - all of the information about a tweet
* @return {String} tweetText - a string that contains the appropriate html elements to display
*                              links and media correctly
*/
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

// Section 3: If any exist, draw geolocated tweets on a google map ------------------------------------------------------------------------------------------------------------------------------

/**
* Creates a google map centered on the UK and places it on the screen. Iterates through all geo located
* tweets for display.
* @param {Object} geoTweets - An object containing all geoTweets
*/
function initializeMap(geoTweets){
    var myLatlng = new google.maps.LatLng(54.504682, -0.436730);
    var mapOptions = {
        zoom: 6,
        center: myLatlng}
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    for(i=0; i<geoTweets.length; i++){
        generateMapMarker(geoTweets[i], map);
    }
}

/**
* Takes each tweet with geolocation and the map and places markers at the appropriate places on the map.
* @param {Object} geoTweet - A tweet object
* @param {Var} map - the google map on the screen
*/
function generateMapMarker(geoTweet, map){
    var lat = geoTweet.coordinates.coordinates[1];
    var long = geoTweet.coordinates.coordinates[0];
    var myLatlng = new google.maps.LatLng(lat, long);
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title:"tweet"});
    var infowindow = new google.maps.InfoWindow({
        content: geoTweet.text,
        maxWidth:200 });
    google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);});
}

// Section 4: JQuery Autocomplete plugin -----------------------------------------------------------------------------------------------------

/**
* Listens to the team input field and generates autocomplete suggestions as the user types.
*/
$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/getClubs.html',
        success: function (data) {
            var clubs =[]
            for(i=0; i<data.length; i++){
                clubs.push(data[i].name);
            }
            $( "#team" ).autocomplete({
                source: clubs
            });
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
});


/**
* Listens to the players input field and generates autocomplete suggestions as the user types.
* Players are entered as a comma separated list which has been implemented using the code from
* the official documentation which can be found at https://jqueryui.com/autocomplete/#multiple.
*/
$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/getPlayers.html',
        success: function (data) {
            var players =[]
            for(i=0; i<data.length; i++){
                players.push(data[i].name);
            }
            
            function split( val ) {
              return val.split( /,\s*/ );
            }
            function extractLast( term ) {
              return split( term ).pop();
            }
            $( "#players" )
              // don't navigate away from the field on tab when selecting an item
              .bind( "keydown", function( event ) {
                if ( event.keyCode === $.ui.keyCode.TAB &&
                    $( this ).autocomplete( "instance" ).menu.active ) {
                  event.preventDefault();
                }
              })
              .autocomplete({
                minLength: 0,
                source: function( request, response ) {
                  // delegate back to autocomplete, but extract the last term
                  response( $.ui.autocomplete.filter(
                    players, extractLast( request.term ) ) );
                },
                focus: function() {
                  // prevent value inserted on focus
                  return false;
                },
                select: function( event, ui ) {
                  var terms = split( this.value );
                  // remove the current input
                  terms.pop();
                  // add the selected item
                  terms.push( ui.item.value );
                  // add placeholder to get the comma-and-space at the end
                  terms.push( "" );
                  this.value = terms.join( ", " );
                  return false;
                }
              });

        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
});


