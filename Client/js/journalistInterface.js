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

                o[this.name] = [this.value] || [''];

            }
        });
        validateInput(o);
    };


function validateInput(userInput){
	//check that the date isn't in past
	//convert entered string into a date
    var dateInput = userInput.date[0].trim()
    var parts = null;
    var enteredDate = null;

    if (dateInput.indexOf('-') > -1){
        //date was entered using the date picker
        parts =userInput.date[0].trim().split('-');
        enteredDate = new Date(parts[0], parts[1]-1, parts[2]);
        console.log(parts)
    } else {
        //date was entered without the date picker
        parts =userInput.date[0].trim().split('/');
        enteredDate = new Date(parts[2],parts[1]-1,parts[0]);
    }
	//check that date isn't in the past
	var now = new Date();
    console.log(enteredDate);
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
    } else if(JSON.stringify(userInput.team1) == JSON.stringify(userInput.team2)){
        alert("Team validation failed\nEntered teams cannot be the same");
    }else {
        //a team has been entered so check that they both exist in the database
        fetchClubTwitterHandle(userInput,JSON.stringify(userInput.team1));
    }
    return false;
}

function sendDataToServer(userInput){
    //all validations have passed
    $('.swirly').css('display','block');
    url = 'http://localhost:3000/';
    //data = JSON.stringify(userInput);
    //$('#team1_id').val()

    data = JSON.stringify({"date": userInput.date, "team1": $('#team1_id').val(), "team2": $('#team2_id').val()});
    console.log(data);
    $.ajax({
        dataType: 'json',
        contentType: "application/json",
        type: 'POST',
        url: url+'journalistBrief.html',
        data: data,
        success: function (data) {
            $('.swirly').css('display','none');
            handleResponseFromServer(data);
        },
        error: function (xhr, status, error) {
            $('.swirly').css('display','none');
            console.log('Error: ' + error.message);

        }
    });
    return false;
}

/**
* Sends an AJAX call that attempts to retrieve the relevant twitter handle for the entered
* team if it exists.
* @param {Object} userInput - the input that the user has entered into the form
* @param {Array} data - the data collected from the database, will either be empty or contain handle
* @param {String} eventId - the id of the button that was pressed
*/
function fetchClubTwitterHandle(userInput,data){
    $.ajax({
        dataType: 'json',
        contentType: "application/json",
        type: 'POST',
        url: 'http://localhost:3000/findClubTwitterHandle.html',
        data: data,
        success: function (data) {
            if(data.length == 0){
                //the team entered has not been recognised in the database
                alert("Team validation has failed\nTeam 1 was not chosen from the options available");
                return false;
            } else {
                //team 1 was valid so now repeat ajax for team 2
                team2 = JSON.stringify(userInput.team2)
                $.ajax({
                    dataType: 'json',
                    contentType: "application/json",
                    type: 'POST',
                    url: 'http://localhost:3000/findClubTwitterHandle.html',
                    data: team2,
                    success: function (team2) {
                        if(team2.length == 0){
                            //the team entered has not been recognised in the database
                            alert("Team validation has failed\nTeam 2 was not chosen from the options available");
                            return false;
                        } else {
                            sendDataToServer(userInput);
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    }
                });
            }
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
}






// Section 2: Handle the response that is sent back from the server to get stuff for display ---------------------------------------------------------------------------------------------------

function handleResponseFromServer(data){
    //for each team
    //name
    //description
    //players slider
    //manager
    //stadium

    for(var key in data){
        var team = data[key]
        console.log(key)
        console.log(team)

        var teamContainer = document.createElement("div");
        var teamName = document.createElement("p");
        var abstractTitle = document.createElement("p");
        var abstractText = document.createElement("p");
        var playersTitle = document.createElement("p");
        var playersSlider = document.createElement("div");
        var managerContainer = document.createElement("div");
        var managerTable = document.createElement("table");
        var managerRow = document.createElement("tr");
        var managerColumn1 = document.createElement("td");
        var managerColumn2 = document.createElement("td");
        var managerTitle = document.createElement("p");
        var managerName = document.createElement("p");
        var managerImg = document.createElement("img");
        var managerText = document.createElement("p");
        var stadiumContainer = document.createElement("div");
        var stadiumTable = document.createElement("table");
        var stadiumRow = document.createElement("tr");
        var stadiumColumn1 = document.createElement("td");
        var stadiumColumn2 = document.createElement("td");
        var stadiumTitle = document.createElement("p");
        var stadiumName = document.createElement("p");
        var stadiumImg = document.createElement("img");
        var stadiumText = document.createElement("p");

        $('#teams_displays').append(teamContainer);
        teamContainer.appendChild(teamName);
        teamContainer.appendChild(document.createElement("br"));
        teamContainer.appendChild(document.createElement("br"));

        teamContainer.appendChild(abstractTitle);
        teamContainer.appendChild(document.createElement("br"));

        teamContainer.appendChild(abstractText);
        teamContainer.appendChild(document.createElement("br"));
        teamContainer.appendChild(document.createElement("br"));

        teamContainer.appendChild(playersTitle);
        teamContainer.appendChild(document.createElement("br"));

        teamContainer.appendChild(playersSlider);
        teamContainer.appendChild(document.createElement("br"));

        teamContainer.className="display_tile";
        $(teamContainer).css("padding", "20px");
        $(teamName).html(team.clubName.value);
        $(teamName).css('font-size','180%');
        $(abstractTitle).html('Description:');
        abstractTitle.className = "subheading";
        $(abstractText).html(team.clubAbstract.value);
        $(playersTitle).html('Players:');
        playersTitle.className = "subheading";
        playersSlider.className ='dark-panel';

        for(var i=0; i<team.players.length; i++){
            //create player tile
            //put info in tile
            //append to slider

            var playerTile = document.createElement("div");
            var playerImg = document.createElement("img");
            var playerName = document.createElement("p");
            var playerPos = document.createElement("p");
            var playerDOB = document.createElement("p");

            playersSlider.appendChild(playerTile);
            playerTile.appendChild(playerImg);
            playerTile.appendChild(document.createElement("br"));
            playerTile.appendChild(playerName);
            playerTile.appendChild(document.createElement("br"));
            playerTile.appendChild(playerPos);
            playerTile.appendChild(document.createElement("br"));
            playerTile.appendChild(playerDOB);

            playerTile.className = "playertile";
            $(playerImg).attr('src', team.players[i].playerThumbnail.value);
            playerImg.className = "playerImg";
            $(playerName).html(team.players[i].playerName.value);
            $(playerPos).html(team.players[i].playerPosition.value);
            $(playerDOB).html(team.players[i].playerDOB.value);
        }


        teamContainer.appendChild(managerContainer);
        managerContainer.appendChild(managerTitle);
        managerContainer.appendChild(document.createElement("br"));
        managerContainer.appendChild(managerTable);
        managerTable.appendChild(managerRow);
        managerRow.appendChild(managerColumn1);
        managerRow.appendChild(managerColumn2);

        managerColumn1.appendChild(managerName);
        managerColumn1.appendChild(document.createElement("br"));
        managerColumn1.appendChild(managerImg);
        managerColumn1.appendChild(document.createElement("br"));
        managerColumn2.appendChild(managerText);
        managerColumn2.appendChild(document.createElement("br"));

        teamContainer.appendChild(document.createElement("br"));
        teamContainer.appendChild(document.createElement("br"));

        teamContainer.appendChild(stadiumContainer);
        stadiumContainer.appendChild(stadiumTitle);
        stadiumContainer.appendChild(document.createElement("br"));
        stadiumContainer.appendChild(stadiumTable);
        stadiumTable.appendChild(stadiumRow);
        stadiumRow.appendChild(stadiumColumn1);
        stadiumRow.appendChild(stadiumColumn2);

        stadiumColumn1.appendChild(stadiumName);
        stadiumColumn1.appendChild(document.createElement("br"));
        stadiumColumn1.appendChild(stadiumImg);
        stadiumColumn1.appendChild(document.createElement("br"));
        stadiumColumn2.appendChild(stadiumText);
        stadiumColumn2.appendChild(document.createElement("br"));

        $(managerTitle).html('Manager:');
        managerTitle.className = "subheading";
        $(managerColumn1).css('width','30%');
        $(managerName).html(team.clubManagerName.value);
        $(managerImg).attr('src', team.clubManagerThumbnail.value)
        $(managerImg).css('height','200px');
        $(managerImg).css('display', 'block-inline');
        $(managerText).html(team.clubManagerAbstract.value);
        
        
        //stadiumContainer.className = "dark-panel-no-scroll";
        $(stadiumTitle).html('Stadium:');
        stadiumTitle.className = "subheading";
        $(stadiumColumn1).css('width','30%');
        $(stadiumName).html(team.clubGroundName.value);
        $(stadiumImg).attr('src', team.clubGroundThumbnail.value);
        $(stadiumImg).css('height','200px');
        $(stadiumImg).css('display', 'block-inline');
        $(stadiumText).html(team.clubGroundAbstract.value);


        teamContainer.appendChild(document.createElement("br"));
        teamContainer.appendChild(document.createElement("br"));


        $(teamContainer).css("display", "block");
    }


}


// Section 3: JQuery Autocomplete plugin -----------------------------------------------------------------------------------------------------
/**
* Listens to the team input fields and generates autocomplete suggestions as the user types.
*/
/*$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/getClubs.html',
        success: function (data) {
            var clubs =[]
            console.log(data)
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
*/
$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/getClubs.html',
        success: function (data) {
            var clubs =[]
            for(i=0; i<data.length; i++){
                var club = {value: data[i].dbpediaPage, label: data[i].name}
                clubs.push(club)
            }
            $( "#team1" ).autocomplete({
                source: clubs,
                select: function (event, ui) {
                    event.preventDefault();
                    $("#team1").val(ui.item.label); // display the selected text
                    $("#team1_id").val(ui.item.value); // save selected id to hidden input
                    return false;
                },
                change: function( event, ui ) {
                    $( "#team1_id" ).val( ui.item? ui.item.value : 0 );
                },
                focus: function(event, ui) {
                    event.preventDefault();
                    $("#team1").val(ui.item.label);
                }
            });
            $( "#team2" ).autocomplete({
                source: clubs,
                select: function (event, ui) {
                    event.preventDefault();
                    $("#team2").val(ui.item.label); // display the selected text
                    $("#team2_id").val(ui.item.value); // save selected id to hidden input
                    return false;
                },
                change: function( event, ui ) {
                    $( "#team2_id" ).val( ui.item? ui.item.value : 0 );
                },
                focus: function(event, ui) {
                    event.preventDefault();
                    $("#team2").val(ui.item.label);
                }
            });
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
});
