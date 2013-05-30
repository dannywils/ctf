//global user variable
var user = null;
var flagcolors = ['red', 'blu'];
var basecolors = ['red', 'blue'];
var bases = [false, false];
var db, map;
$('document').ready(function () {
	//create the database and map objects
	db = new mongolab();
	map = new mapper();
	//run the startup functions
	setup();
	initializeUser();

	//check if the player has a cookie
	function setup(){
		var username = $.cookie('username');
		var uuid = $.cookie('uuid');
		//if they are not signed in, prompt for a username
		if (username === undefined || uuid === undefined) {
			while(username === undefined || username == null){
				username = prompt("Please enter your name", "Enter Name");
			}
			$.cookie('username', username, {
				expires: 1
			});
			$.cookie('uuid', UUID(), {
				expires: 1
			});
			uuid = $.cookie('uuid');
		}
		user = { uuid:uuid, username:username };
	}	

	function initializeUser(){
		// check if the user exists in the database, if not insert them
		var timeout = new Date(new Date().getTime() - 600000).toISOString();
		
		$.when(
			db.select("users", {
				"date": {
					"$gt": timeout
				}
			})
		).then(
			function(users){
				var checkUser = userExists(user,users);
				if(checkUser !== undefined){
					user = checkUser;
					startGame();
				} else {
					var team = getUsersTeam(users);
					user = {
						username: user.username,
						uuid: user.uuid,
						team: team.team,
						captain: team.captain,
						date: new Date().toISOString(),
					}
					$.when(db.insert("users", user)).then(function(){
						startGame();
					});
				}
			}
		);
	}

	function startGame() {
		$('.result').html(user.username);
		//if the data is a captain, show the captain menu
		if (user.captain) {
			$('.captain').show();
		}
		$('.player').show();
		$(".team").html("Team " + user.team);
		$(".overlay").addClass('team'+user.team);
		//show the map
		initializeLocation();
		//refresh every x seconds
		setInterval(function(){
			refresh();
		}, 2000);
	}

	function refresh(){
		var timeout = new Date(new Date().getTime() - 600000 ^ 10).toISOString();
		$.when(
			db.select('users', {"date": {"$gt": timeout}}),
			db.select('teams', {})
		).then(function(users,flags){
			handleUsers(users[0]);
			handleFlags(flags[0]);
		});
	}

	function handleUsers(users){
		//plot the other users
		for (var i = users.length - 1; i >= 0; i--) {
				// update the current users information
			if(users[i].uuid == user.uuid){
				user = users[i];
			} else {
				//plot other players with blank markers
				map.placeMarker(users[i].uuid, users[i].location, users[i].username, 'http://maps.google.com/mapfiles/kml/paddle/' + flagcolors[users[i].team - 1] + '-blank.png');
			}
		};
		//plot yourself last
		map.placeMarker(user.uuid, user.location, 'You ('+user.username+')', 'http://maps.google.com/mapfiles/kml/paddle/' + flagcolors[user.team - 1] + '-diamond.png');
		if(user.hasflag){
			$(".message").show();
		}
	}

	//get flag and base locations
	function handleFlags(teams) {
		for (var i = teams.length - 1; i >= 0; i--) {
			var team = teams[i];
			//hide the flag if it's been picked up
			if(team.pickedup === undefined || !team.pickedup){
				map.placeMarker(team.uuid, team.flag, 'Flag ' + team.team, 'http://maps.google.com/mapfiles/kml/paddle/' + flagcolors[team.team - 1] + '-stars.png');
			}
			map.placeCircle(team.team, team.base, basecolors[team.team - 1]);
			// set the flag as placed
			bases[team.team] = true;
			$('.score [data-team='+team.team+']').text(team.score);
		}
		//if the flag has been set, hide the place button
		if(bases[user.team]){
			$('.placeflag').hide();
		} else {
			$('.placeflag').show();
		}
		//check if the user is in the base
		checkBase();
	}

	//show the map
	function initializeLocation() {
		watchLocation(function (coords) {
			user.location = coords.latitude + ',' + coords.longitude;
			$('.coords').html(user.location);
			
			//send your location to the server
			db.update('users',
			{
				uuid: user.uuid
			}, 
			{
				location: user.location,
				date: new Date().toISOString()
			});
			//call refresh to get users and teams
			refresh();
			//center on the user location
			if (user.location !== undefined) {
				var latlng = new google.maps.LatLng(user.location.split(",")[0], user.location.split(",")[1]);
				map.center(latlng);
			}
		}, function () {
			//error with geolocation
			$('.coords').html('Error getting coordinates.');
		}, {
			//options
			timeout: 0
		});
	}
});

