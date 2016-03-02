console.log('inside js')

var sendALLButton = document.getElementById('sendALLButton');
sendALLButton.onclick = sendData;

var sendANYButton = document.getElementById('sendANYButton');
sendANYButton.onclick = sendData;

	function sendData() {
        var id = event.target.id;
        if(id == "sendALLButton"){
        	var form = $('#myForm')
        	sendALLAjaxQuery('http://localhost:3000/', JSON.stringify($('form').serializeObject()));
        	
        } else {
        	console.log("ANY")
        }
        return false;
	}



	function sendALLAjaxQuery(url, data) {
        console.log('sendAjaxQuery ' + url);
        $.ajax({
			dataType: 'json',
			data: data,
            type: 'POST',
            url: url + 'getAllTweets.html',
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
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
