//global user variable
var user = null;
var colors = ['red', 'blu'];
var bases = [false, false];
var db;
$('document').ready(function () {
	//create the database object
	db = new mongolab();
	//check if the player has a cookie
	var username = $.cookie('username');
	var uuid = $.cookie('uuid');

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

	// check if the user exists in the database, if not insert them
	prepareUser(username, uuid, function (data) {
		//if the user doesn't exists, add them and refresh
		if (data.length == 0) {
			//check what team they should be on
			getTeam(function (team, captain) {
				db.insert("users", {
					username: username,
					team: team,
					uuid: uuid,
					captain: captain,
					date: new Date().toISOString(),
				}, function () {
					//refresh after insert
					document.location = '';
				});
			});
			//otherwise show the map
		} else {
			startGame(data);
		}
	});


	//check if the user exists and is active

	function prepareUser(username, uuid, callback) {
		var timeout = new Date(new Date().getTime() - 600000).toISOString();
		db.select("users", {
			username: username,
			uuid: uuid,
			"date": {
				"$gt": timeout
			}
		},
		callback);
	}

	//will pass team to callback
	function getTeam(callback) {
		console.log("getting teams");
		db.select("users", {}, function (data) {
			var teams = [];
			var captain = false;
			teams[1] = 0;
			teams[2] = 0;
			for (var i = data.length - 1; i >= 0; i--) {
				if (data[i].team === undefined) {
					continue;
				}
				var team = data[i].team;
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
			callback(team, captain);
		});
	}

	function startGame(data) {
		$('.result').html(data[0].username);
		user = data[0];
		//if the user is a captain, show the captain menu
		if (user.captain) {
			$('.captain').show();
		}
		$('.player').show();
		$(".team").html("Team " + user.team);
		$(".overlay").addClass('team'+user.team);
		//show the map
		showMap();
		//refresh every two seconds
		setInterval(refresh, 2000);
	}

	function refresh(){
		getFlags();
		getUsers();
	}


	function checkBase(){
		var otherteam = otherTeam(user.team);
		if(inBase(otherteam)){
			$('.captureflag').css('visibility','visible');
		} else {
			$('.captureflag').css('visibility','hidden');
		}
		if(user.hasflag && inBase(user.team)){
			score();
		}
	}

	function score(){
		db.select('teams',{ team: user.team }, function(data){
			db.update('teams',{ team: user.team }, { pickedup: false, score: data[0].score + 1 });
		});
		db.update('users',{ uuid: user.uuid }, { hasflag: false });
		$(".message").hide();
	}

	var map = new mapper();

	//get the player locations
	function getUsers() {
		//only show people who have been active within the last 10 minutes
		var timeout = new Date(new Date().getTime() - 600000 ^ 10).toISOString();
		//select all users that are not you
		db.select('users', {
			"date": {
				"$gt": timeout
			}
		}, function (users) {
			//console.log('users received.', users);
			//plot the other users
			for (var i = users.length - 1; i >= 0; i--) {
				//plot other players with blank markers
				map.placeMarker(users[i].uuid, users[i].location, users[i].username, 'http://maps.google.com/mapfiles/kml/paddle/' + colors[users[i].team - 1] + '-blank.png');
				// update the current users information
				if(users[i].uuid == user.uuid){
					user = users[i];
				}
			};
			//if it is the current user, plot with a diamond
			map.placeMarker(user.uuid, user.location, 'You ('+user.username+')', 'http://maps.google.com/mapfiles/kml/paddle/' + colors[user.team - 1] + '-diamond.png');
		});
	}

	//get flag and base locations
	function getFlags() {
		db.select('teams', {}, function (teams) {
			//console.log('flags received', flags);
			for (var i = teams.length - 1; i >= 0; i--) {
				var team = teams[i];
				//hide the flag if it's been picked up
				if(team.pickedup === undefined || !team.pickedup){
					map.placeMarker(team.uuid, team.flag, 'Flag ' + team.team, 'http://maps.google.com/mapfiles/kml/paddle/' + colors[team.team - 1] + '-stars.png');
				}
				map.placeCircle(team.team, team.base, colors[team.team - 1]);
				bases[team.team - 1] = true;
				$('.score [data-team='+team.team+']').text(team.score);

			}
			//if the flag has been set, hide the place button
			if(bases[user.team - 1]){
				$('.placeflag').hide();
			}
			checkBase();
		});
	}

	function showMap() {
		watchLocation(function (coords) {
			$('.coords').html(coords.latitude + ',' + coords.longitude);
			user.location = coords.latitude + ',' + coords.longitude;
			//send your location to the server
			db.update('users',
			{
				uuid: user.uuid
			}, {
				location: user.location,
				date: new Date().toISOString()
			});
			//get the other users
			refresh();

			//center on the user location
			if (user.location !== undefined) {
				var latlng = new google.maps.LatLng(user.location.split(",")[0], user.location.split(",")[1]);
				map.center(latlng);
			}
		}, function () {
			$('.coords').html('error');
		}, {
			timeout: 0
		});
	}


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
});

