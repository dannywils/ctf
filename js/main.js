/*
 *	Main game logic
 */

//global user variable
var user = null;
var flagcolors = ['red', 'blu'];
var basecolors = ['red', 'blue'];
var bases = [false, false];
var db, map, game;

window.onload = function () {
	game = new game();
};

function game() {
	//create the database and map objects
	db = new mongolab();
	map = new mapper();
	var parent = this;
	//check if the player has a cookie
	var setup = function () {
		var username = $.cookie('username');
		var uuid = $.cookie('uuid');
		//if they are not signed in, prompt for a username
		if (username === undefined || uuid === undefined) {
			while (username === undefined || username == null) {
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
		user = {
			uuid: uuid,
			username: username
		};

	}

	var initializeUser = function () {
		// check if the user exists in the database, if not insert them
		var timeout = new Date(new Date().getTime() - 600000).toISOString();
		$.when(
			//get all users
			db.select("users", {
				"date": {
					"$gt": timeout
				}
			})
		).then(
			function (users) {
				var checkUser = userExists(user, users);
				//if the user exists, start the game
				if (checkUser !== undefined) {
					user = checkUser;
					startGame();
				} else {
					//if the user does not exist, create them
					var team = getUsersTeam(users);
					user = {
						username: user.username,
						uuid: user.uuid,
						team: team.team,
						captain: team.captain,
						date: new Date().toISOString(),
						out: false,
					}
					$.when(db.insert("users", user)).then(function () {
						startGame();
					});
				}
			}
		);
	}
	//sets the view and starts the interval
	var startGame = function () {
		$('.result').html(user.username);
		//if the data is a captain, show the captain menu
		if (user.captain) {
			$('.captain').show();
		}
		$('.player').show();
		$(".team").html("Team " + user.team);
		$(".overlay").addClass('team' + user.team);
		//show the map
		initializeLocation();
		//refresh every x seconds
		setInterval(function () {
			refresh();
		}, 1000);
	}

	//refresh the data. this is called on an interval
	var refresh = function () {
		var timeout = new Date(new Date().getTime() - 600000 ^ 10).toISOString();
		$.when(
			db.select('users', {
				"date": {
					"$gt": timeout
				}
			}),
			db.select('teams', {})
		).then(function (users, flags) {
			handleUsers(users[0]);
			handleFlags(flags[0]);
			//if nobody has the opponents flag, check if we're able to pick it up
			if (userHasFlag(users[0]), otherTeam(user.team)) {
				checkBase();
			}

			if(user.out){
				$('.player').hide();
				$('.message').show();
			}
		});
		//if user has the flag and theyre in their base, score
		if (user.hasflag && inBase(user.team)) {
			score();
		}

		if(user.out && inBase(user.team)) {
			user.out = false;
			$('.player').show();
			$('.message').hide();
			db.update('users',{ uuid: user.uuid }, { out: false });
		}
	}

	//handle users return by the service
	var handleUsers = function (users) {
		var enemies = 0;
		//plot the other users
		for (var i = users.length - 1; i >= 0; i--) {
			// update the current users information
			if (users[i].uuid === user.uuid) {
				user = users[i];
			} else {
				//plot other players with blank markers
				if(users[i].out == false){
					map.placeMarker(users[i].uuid, users[i].location, users[i].username, 'http://maps.google.com/mapfiles/kml/paddle/' + flagcolors[users[i].team - 1] + '-blank.png');
				}
			}
			// the user is an oppenent
			if(users[i].team !== user.team 
				&& user.location !== undefined
				&& user.out == false
				&& users[i].out == false
			){
				var lat1 = user.location.split(",")[0];
				var lon1 = user.location.split(",")[1];

				var lat2 = users[i].location.split(",")[0];
				var lon2 = users[i].location.split(",")[1];
				// 5 meters
				var tagDistance = 0.005;
				if(getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) < tagDistance){
					enemies++;
					$('button.tag').data('uuid',users[i].uuid).show();
				} 
			}
		} 
		if(enemies == 0){
			$('button.tag').hide();
		}
		//plot yourself last
		map.placeMarker(user.uuid, user.location, 'You (' + user.username + ')', 'http://maps.google.com/mapfiles/kml/paddle/' + flagcolors[user.team - 1] + '-diamond.png');
		if (user.hasflag) {
			$(".message").show();
		}
	}

	//get flag and base locations
	var handleFlags = function (teams) {
		for (var i = teams.length - 1; i >= 0; i--) {
			var team = teams[i];
			//hide the flag if it's been picked up
			if (team.pickedup === undefined || !team.pickedup) {
				map.placeMarker(team.uuid, team.flag, 'Flag ' + team.team, 'http://maps.google.com/mapfiles/kml/paddle/' + flagcolors[team.team - 1] + '-stars.png');
			}
			map.placeCircle(team.team, team.base, basecolors[team.team - 1]);
			// set the flag as placed
			bases[team.team] = true;
			$('.score [data-team=' + team.team + ']').text(team.score);
		}
		//if the flag has been set, hide the place button
		if (bases[user.team]) {
			$('.placeflag').hide();
		} else {
			$('.placeflag').show();
		}
	}
	// set the geolocation

	var initializeLocation = function () {
		watchLocation(parent.updateCoords,
			function () {
				//if there is an error with geolocation
				$('.coords').html('Error getting coordinates.');
			}, {
				//set some options
				timeout: 0
			});
	}

	this.updateCoords = function (coords) {
		user.location = coords.latitude + ',' + coords.longitude;
		$('.coords').html(user.location);

		//send your location to the server
		db.update('users', {
			uuid: user.uuid
		}, {
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
	}
	//run the startup functions
	setup();
	initializeUser();
};
