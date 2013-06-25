/*
*	Helper functions
*/

// Generate RFC4122 v4 UUID from http://stackoverflow.com/a/2117523
function UUID(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

// convert comma seperated gps location to google maps LatLng
function strToLat(location){
	return new google.maps.LatLng(location.split(",")[0],location.split(",")[1]);
}

//calculates great-circle distances between the two points – that is,
//the shortest distance over the earth’s surface – using the ‘Haversine’ formula.
//http://stackoverflow.com/a/27943
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}
function deg2rad(deg) {
	return deg * (Math.PI / 180)
}
// returns the opposite team
function otherTeam(team){
	return otherteam = team == 1 ? 2 : 1;
}

// does the user exist within the userArray?
function userExists(user, userArray){
	for (var i = userArray.length - 1; i >= 0; i--) {
		if(user.uuid === userArray[i].uuid){
			return userArray[i];
		}
	};
}

// which team should the user be on given the users array
function getUsersTeam(users) {
	var teams = [];
	var captain = false;
	teams[1] = 0;
	teams[2] = 0;
	for (var i = users.length - 1; i >= 0; i--) {
		if (users[i].team === undefined) {
			continue;
		}
		var team = users[i].team;
		if (team == 1) {
			teams[1]++;
		} else if (team == 2) {
			teams[2]++;
		}
	};
	// assign the user to the lowest team
	var team = 1;
	if (teams[1] > teams[2]) {
		team = 2;
	}
	// if the user is the first on the team, make them a captain
	if (teams[team] == 0) {
		captain = true;
	}
	// pass the team and captain to the handler
	return {team: team, captain:captain};
}

// check if the user is in the other base for enabling picking up the flag
function checkBase(){
	var otherteam = otherTeam(user.team);
	if(bases[1] && bases[2] && inBase(otherteam) && !user.hasflag){
		$('.captureflag').show();
	} else {
		$('.captureflag').hide();
	}
}

// score a point for the user's team
function score(){
	if(!user.hasflag){
		return;
	}
	user.hasflag = false;
	$(".message").hide();
	$("#scored").slideDown('slow').delay(1500).slideUp('slow');
	$.when(
		db.select('teams',{ team: user.team }),
		db.update('users',{ uuid: user.uuid }, { hasflag: false })
	).then(
		function(teams){
			db.update('teams',{ team: user.team }, { pickedup: false, score: teams[0][0].score + 1 });
		}
	);
}

// returns true if the current user is in the base of the passed team
function inBase(team){
	var latlng = strToLat(user.location);
	var base;
	for (var key in circles) {
		if(key == team){
			base = circles[key];
		}
	}
	if(base !== undefined){
		var bounds = base.getBounds();
		return bounds.contains(latlng);
	}
	return false;
}

//returns true if any user in the array on the passed team holds a flag
function userHasFlag(userArray,team){
	for (var i = userArray.length - 1; i >= 0; i--) {
		if(userArray[i].hasflag && userArray[i].team === team){
			true;
		}
	}
	return false;
}
