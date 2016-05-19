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
    var j = 0;
    for(var key in data){
        j=j+1;
        var team = data[key]
        console.log(key)
        console.log(team)

        var teamContainer = document.createElement("div");

        var teamName = document.createElement("p");

        var abstractTitle = document.createElement("p");
        var abstractText = document.createElement("p");
        var playersTitle = document.createElement("p");
        var playersSlider = document.createElement("div");

        var playerProfileContainer = document.createElement("div");

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

        var mapTitle = document.createElement("p");
        var mapText = document.createElement("p");
        var map = document.createElement("div");

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

        teamContainer.appendChild(playerProfileContainer);
        teamContainer.appendChild(document.createElement("br")); 

        teamContainer.className="display_tile_shown";
        $(teamContainer).css("padding", "20px");
        teamContainer.setAttribute('about',team.club);
        $(teamName).html(team.clubName.value);
        $(teamName).css('font-size','180%');
        teamName.setAttribute('property','dbp:clubname');
        $(abstractTitle).html('Description:');
        abstractTitle.className = "subheading";
        $(abstractText).html(team.clubAbstract.value);
        abstractText.setAttribute('property','dbo:abstract');
        $(playersTitle).html('Players:');
        playersTitle.className = "subheading";
        playersSlider.className ='dark-panel';
        $(playerProfileContainer).css('display','none');
        playerProfileContainer.id = "playerProfile"+j;

        for(var i=0; i<team.players.length; i++){
            //create player tile
            //put info in tile
            //append to slider

            var playerTile = document.createElement("div");
            var playerImg = document.createElement("img");
            var playerName = document.createElement("p");
            var playerPosContainer = document.createElement("div");
            var playerPos = document.createElement("p");
            var playerDOB = document.createElement("p");
            var id =  "player"+i+j;
            var hashtagId = "#player"+i+j;

            playersSlider.appendChild(playerTile);
            playerTile.appendChild(playerImg);
            playerTile.appendChild(document.createElement("br"));
            playerTile.appendChild(playerName);
            playerTile.appendChild(document.createElement("br"));
            playerTile.appendChild(playerDOB);
            playerTile.appendChild(document.createElement("br"));
            playerTile.appendChild(playerPosContainer);
            playerPosContainer.appendChild(playerPos);
            playerTile.appendChild(document.createElement("br"));

            playerTile.className = "playertile";
            playerTile.id = id;
            playerTile.setAttribute('about',team.players[i].player.value);
            playerTile.setAttribute('property','dbp:name');
            $(playerImg).attr('src', team.players[i].playerThumbnail.value);
            playerImg.className = "playerImg";
            playerImg.setAttribute('property','dbo:thumbnail');
            $(playerName).html(team.players[i].playerName.value);
            playerName.setAttribute('property','dbp:name');
            $(playerPos).html(team.players[i].playerPositionLabel.value);
            $(playerDOB).html(team.players[i].playerDOB.value);
            playerDOB.setAttribute('property','dbo:birthDate');
            playerPosContainer.setAttribute('about',team.players[i].playerPosition.value);
            playerPosContainer.setAttribute('property','dbp:position');
            playerPos.setAttribute('property','rdfs:label');

            $(hashtagId).on( 'click', function(event) {
               //alert( 'WORKS! ' + jQuery(this).attr('about') );
               var eventId = event.currentTarget.id
               var teamNo = eventId.substring(eventId.length-1,eventId.length);
               playerData = {};
               playerData["player"] = jQuery(this).attr('about');
               data = JSON.stringify(playerData);
               console.log(data)
               $.ajax({
                    dataType: 'json',
                    contentType: "application/json",
                    type: 'POST',
                    url: url+'getPlayerHistory.html',
                    data: data,
                    success: function (data) {
                        console.log(data)
                        displayPlayerProfile(data,teamNo);
                    },
                    error: function (xhr, status, error) {
                        console.log('Error: ' + error.message);
                    }
                });

                
            });
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

        managerRow.setAttribute('property','dbp:manager');
        managerRow.setAttribute('about',team.manager.value);
        managerName.setAttribute('property','dbp:name');
        managerImg.setAttribute('property','dbo:thumbnail');
        managerText.setAttribute('property','dbo:abstract');

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
        teamContainer.appendChild(document.createElement("br"));
        teamContainer.appendChild(document.createElement("br"));

        stadiumRow.setAttribute('property','dbp:ground');
        stadiumRow.setAttribute('about',team.ground.value);
        stadiumName.setAttribute('property','dbp:name');
        stadiumImg.setAttribute('property','dbo:thumbnail');
        stadiumText.setAttribute('property','dbo:abstract');

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

        teamContainer.appendChild(mapTitle);
        teamContainer.appendChild(document.createElement("br"));
        teamContainer.appendChild(mapText);
        teamContainer.appendChild(document.createElement("br"));
        teamContainer.appendChild(map);

        mapTitle.className="subheading";
        $(mapTitle).html('Team Map');
        $(mapText).html('The map below displays the birthplace of each player on the team.');
        map.id = "teamMap"+j;
        $(map).css('width', '100%');
        $(map).css('height', '400px');

        teamContainer.appendChild(document.createElement("br"));
        teamContainer.appendChild(document.createElement("br"));

        //set up the map
        initializeMap(team.players, "teamMap"+j);
    }


}

function displayPlayerProfile(data, teamNo){
    var profileId = "playerProfile"+teamNo;
    var profileContainer = document.getElementById(profileId);
    //profileContainer.setAttribute('about',data.playerResource.value);


    //if it has any children the profile is currently showing a different player so clear this first
    while (profileContainer.firstChild) {
        profileContainer.removeChild(profileContainer.firstChild);
    }

    var playerProfileName = document.createElement("p");
    var playerProfileFullName = document.createElement("p");
    var playerProfileDOB = document.createElement("p");
    var playerProfilePlaceOfBirthDiv = document.createElement("div");
    var playerProfilePlaceOfBirth = document.createElement("p");
    var playerProfilePositionDiv = document.createElement("div");
    var playerProfilePosition = document.createElement("p");
    var playerProfileImg = document.createElement("img");
    var playerProfileHistoryContainer = document.createElement("div");
    var playerProfileTable = document.createElement("table");
    var playerProfileRow = document.createElement("tr");
    var playerProfileColumn1 = document.createElement("td");
    var playerProfileColumn2 = document.createElement("td");
    var closeButton = document.createElement('input');
    closeButton.setAttribute('type','button');
    closeButton.setAttribute('name','Close Profile');
    closeButton.setAttribute('value','Close Profile');
    closeButton.id="closeProfile"+teamNo;
    closeButton.onclick = closeProfile;

    profileContainer.appendChild(playerProfileTable);
    playerProfileTable.appendChild(playerProfileRow);
    playerProfileRow.appendChild(playerProfileColumn1);
    playerProfileRow.appendChild(playerProfileColumn2);
    playerProfileColumn1.appendChild(playerProfileName);
    playerProfileColumn1.appendChild(document.createElement("br"));
    playerProfileColumn1.appendChild(playerProfileFullName);
    playerProfileColumn1.appendChild(document.createElement("br"));
    playerProfileColumn1.appendChild(playerProfileDOB);
    playerProfileColumn1.appendChild(document.createElement("br"));
    playerProfileColumn1.appendChild(playerProfilePlaceOfBirthDiv);
    playerProfilePlaceOfBirthDiv.appendChild(playerProfilePlaceOfBirth);
    playerProfileColumn1.appendChild(document.createElement("br"));
    playerProfileColumn1.appendChild(playerProfilePositionDiv);
    playerProfilePositionDiv.appendChild(playerProfilePosition);
    playerProfileColumn1.appendChild(document.createElement("br"));
    playerProfileColumn1.appendChild(document.createElement("br"));
    playerProfileColumn1.appendChild(playerProfileImg);
    playerProfileColumn1.appendChild(document.createElement("br"));
    playerProfileColumn1.appendChild(document.createElement("br"));
    playerProfileColumn1.appendChild(closeButton);
    playerProfileColumn2.appendChild(playerProfileHistoryContainer);

    $(playerProfileColumn1).css('width','30%');
    $(playerProfileColumn1).css('vertical-align','text-top');
    $(playerProfileName).html("Name: " +data.playerName.value);
    $(playerProfileFullName).html("Full Name: " + data.playerFullname.value);
    $(playerProfileDOB).html("DOB: " + data.playerDOB.value);
    $(playerProfilePlaceOfBirth).html("Place of Birth: " + data.playerBirthPlaceName.value);
    $(playerProfilePosition).html("Player Position (current): " + data.playerPositionLabel.value);
    $(playerProfileImg).attr('src', data.playerThumbnail.value);
    closeButton.className = "btn btn-custom";

    playerProfileName.setAttribute('property','dbp:name');
    playerProfileFullName.setAttribute('property', 'dbp:fullname');
    playerProfileDOB.setAttribute('property', 'dbp:dateOfBirth');
    playerProfilePlaceOfBirthDiv.setAttribute('property', 'dbo:birthPlace');
    playerProfilePlaceOfBirthDiv.setAttribute('about', data.playerBirthPlace.value);
    playerProfilePlaceOfBirth.setAttribute('property', 'rdfs:label');
    playerProfilePositionDiv.setAttribute('property', 'dbo:position');
    playerProfilePositionDiv.setAttribute('about', data.playerPosition.value);
    playerProfilePosition.setAttribute('property','rdfs:label');
    playerProfileImg.setAttribute('property', 'dbo:thumbnail');

    //iterate through the career history and create a tile for each
    for(var i=0; i< data.playerCareerStations.length; i++){
        var careerTile = document.createElement("div");
        var careerClubDiv = document.createElement("div");
        var careerClubName = document.createElement("p");
        var careerClubComment = document.createElement("p");
        var careerYearStart = document.createElement("p");
        var careerMatchCount = document.createElement("p");
        var careerGoalCount = document.createElement("p");

        playerProfileHistoryContainer.appendChild(careerTile);
        careerTile.appendChild(careerClubDiv);
        careerClubDiv.appendChild(careerClubName);
        careerClubDiv.appendChild(document.createElement("br"));
        careerClubDiv.appendChild(careerClubComment);
        careerTile.appendChild(document.createElement("br"));
        careerTile.appendChild(careerYearStart);
        careerTile.appendChild(document.createElement("br"));
        careerTile.appendChild(careerMatchCount);
        careerTile.appendChild(careerGoalCount);

        $(careerClubName).html(data.playerCareerStations[i].playerCareerStationTeamClubName.value);
        $(careerClubComment).html(data.playerCareerStations[i].playerCareerStationTeamComment.value);
        $(careerYearStart).html(data.playerCareerStations[i].playerCareerStationYears.value);
        $(careerMatchCount).html("Matches: " + data.playerCareerStations[i].playerCareerStationMatches.value + "     ");
        $(careerGoalCount).html("Goals: " +data.playerCareerStations[i].playerCareerStationGoals.value);

        careerTile.className = "grey_tile";

        careerTile.setAttribute('property', "dbo:careerStation");
        careerTile.setAttribute('about', data.playerCareerStations[i].playerCareerStation.value);
        careerClubDiv.setAttribute('property', 'dbo:team');
        careerClubDiv.setAttribute('about', data.playerCareerStations[i].playerCareerStationTeam.value);
        careerClubName.setAttribute('property', 'rdfs:label');
        careerClubComment.setAttribute('property', 'rdfs:comment');
        careerYearStart.setAttribute('property','dbo:years');
        careerMatchCount.setAttribute('property', 'dbo:numberOfMatches');
        careerGoalCount.setAttribute('property', 'dbo:numberOfGoals');
    }
    playerProfileHistoryContainer.className = "dark-panel-vertical";

    profileContainer.className = "dark-panel-no-scroll ";
    profileContainer.style.width = "98%";
    profileContainer.style.display="block";
}

function closeProfile(){
    var eventId = event.currentTarget.id
    var teamNo = eventId.substring(eventId.length-1,eventId.length);
    var profileContainer = document.getElementById("playerProfile"+teamNo);
    profileContainer.style.display="none";
}

// Section 3: Google maps ----------------------------------------------------------------------------------------------------------------------
/**
* Creates a google map centered on the UK and places it on the screen. Iterates through all players on the
* team and  displayes their birthplaces.
* @param {Object} plyaers - An object containing all players
* @param {String} mapId - the id of the map element to be initialized
*/
function initializeMap(players, mapId){
    var myLatlng = new google.maps.LatLng(54.504682, -0.436730);
    var mapOptions = {
        zoom: 5,
        center: myLatlng}
    var map = new google.maps.Map(document.getElementById(mapId), mapOptions);

    for(i=0; i<players.length; i++){
        generateMapMarker(players[i], map);
    }



}

/**
* Takes each player with geolocated birth place and the map and places markers at the appropriate places on the map.
* @param {Object} player - a player object
* @param {Var} map - the google map on the screen
*/
function generateMapMarker(player, map){
    var lat = player.playerBirthPlaceLatitude.value;
    var long = player.playerBirthPlaceLongitude.value;
    var myLatlng = new google.maps.LatLng(lat, long);
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title:"Player Birth Place"});
    var infowindow = new google.maps.InfoWindow({
        content: player.playerName.value + "<br>" + "DOB: " +player.playerDOB.value +
        "<br>" + "Place of Birth: " + "<br>" + "<img src = \"" + player.playerThumbnail.value + "\" height = \"30\">",
        maxWidth:200 });
    google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);});
}


// Section 4: JQuery Autocomplete plugin -----------------------------------------------------------------------------------------------------
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
