function sendALLAjaxQuery(url, data) {
        console.log('sendAjaxQuery ' + url);
        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: url+'getAllTweets.html',
            data: data,
            success: function (data) {
                //alert('success '+data);
                //var struct= JSON.parse(data);
                console.log(data)
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
               alert('error connecting');
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
            console.log(data)
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
            console.log(this)
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                console.log('undefined')
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






