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
    var retrieved_tweet_display = $('#retrieved_tweet_display');
    var no_tweets = $('#no_tweets');
    console.log(data)
    no_tweets.html(data.length);

    for(i=0; i<data.length; i++){
        if (data[i].retweeted){
            console.log('retweeted');
        } else {

            var container = document.createElement("div");
            var author = document.createElement("a");
            var tweetText = document.createElement("p");
            var createdAt = document.createElement("p");
            var br1 = document.createElement("br");
            var br2 = document.createElement("br");

            $('#tweets').append(container);
            container.appendChild(author);
            container.appendChild(br1);
            container.appendChild(tweetText);
            container.appendChild(br2);
            container.appendChild(createdAt);

            //handle urls and hashes so that they are linkable
            //URLs
            
            var tweetDisplay = linkifyTweet(data[i]);

            container.className = "tweet";
            $(author).attr('href', "http://www.twitter.com/"+data[i].user.screen_name);
            $(author).text(data[i].user.name + ' @' + data[i].user.screen_name);
            $(tweetText).html(tweetDisplay);
            $(createdAt).text(data[i].created_at);

            


        }
    }

    retrieved_tweet_display.css("display", "block");
    
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
    
    

    //replace each hashtag with href

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






