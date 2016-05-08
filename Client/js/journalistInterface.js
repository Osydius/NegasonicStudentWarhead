//

// Authors: James Hall and Nicola Willis
// Team: NegasonicStudentWarhead
//

// Section 1: Validate and send data to server-----------------------------------------------------------------------------------------------------------------
var generateBriefing = document.getElementById('generateBriefing');
generateBriefing.onclick = buttonClick;

/**
* Called when button is clicked, collects the id of the button
* that triggered the call and hands control over to serializeObject()
*/
function buttonClick() {
    var form = $('#generate_briefing_form');
    JSON.stringify($('form').serializeObject());

    return false;
}

/**
 * Iterates through the terms entered in the form and packages them into an object
 * that contains all of the fields split into separate terms where appropriate. Then
 * kickstarts the validation process.
 */
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
        validateInput(o);
    };

function validateInput(userInput){
	//check that the date isn't in past
	//convert entered string into a date
	var parts =userInput.date.trim().split('/');
	var enteredDate = new Date(parts[2],parts[1]-1,parts[0]); 
	//check that date isn't in the past
	var now = new Date();
	if(enteredDate < now || enteredDate == "Invalid Date"){
		alert("You must enter a valid date that is in the future");
        return false;
	}

	//date validateion passed so validate team inputs
	validateTeamInput(userInput);
}

function validateTeamInput(userInput) {
    //make a call to retrieve the relevant data from database if it exists.
    if (JSON.stringify(userInput.team1).length <= 4 || JSON.stringify(userInput.team2).length <= 4){
        //two teams were not entered so validation fail
        alert("Team validation failed\nYou must enter two teams");
    } else {
        //a team has been entered so first check that this team exists in the database
        fetchClubTwitterHandle(userInput,eventId);
    }
    return false;
}






// Section 2: Handle the response that is sent back from the server to get stuff for display ---------------------------------------------------------------------------------------------------
// Section 3: JQuery Autocomplete plugin -----------------------------------------------------------------------------------------------------
/**
* Listens to the team input fields and generates autocomplete suggestions as the user types.
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
            $( "#team1" ).autocomplete({
                source: clubs
            });
            $( "#team2" ).autocomplete({
                source: clubs
            });
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
});