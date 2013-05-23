//global user variable
var user = null;
var colors = ['red', 'blu'];
var bases = [false, false];
$('document').ready(function () {
	//create the database object
	var db = new mongolab();
	//check if the player has a cookie
	var username = $.cookie('username');
	var uuid = $.cookie('uuid');

	if (username === undefined || uuid === undefined) {
		username = prompt("Please enter your name", "Enter Name");
		$.cookie('username', username, {
			expires: 1
		});
		$.cookie('uuid', UUID(), {
			expires: 1
		});
		uuid = $.cookie('uuid');
	}

	// check if the user exists in the database, if not insert them
	checkUser(username, uuid, function (data) {
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

	function checkUser(username, uuid, callback) {
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
		$('p.result').html('Username: ' + data[0].username);
		user = data[0];
		//if the user is a captain, show the captain menu
		if (user.captain) {
			$('.captain').show();
		}
		//if the flag has been set, hide the place button
		if (user.flag != null) {
			$('.captain button').hide();
		}
		$('.player').show();
		$(".team").html("You are on team " + user.team);
		//show the map
		showMap();
		//refresh every two seconds
		setInterval(refresh, 2000);
	}

	function refresh(){
		getUsers();
		getFlags();
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
			console.log('users received.', users);
			lastUpdate = new Date().toISOString();
			//plot the other users
			for (var i = users.length - 1; i >= 0; i--) {
				//if it is the current user, plot with a diamond
				if (user._id.$oid == users[i]._id.$oid) {
					map.placeMarker(user.uuid, user.location, 'You', 'http://maps.google.com/mapfiles/kml/paddle/' + colors[users[i].team - 1] + '-diamond.png');
				} else {
					//plot other players with blank markers
					map.placeMarker(users[i].uuid, users[i].location, users[i].username, 'http://maps.google.com/mapfiles/kml/paddle/' + colors[users[i].team - 1] + '-blank.png');
				}
			};
		});
	}

	//get flag and base locations
	function getFlags() {
		db.select('flags', {
			"team": {
				"$gt": 0
			}
		}, function (flags) {
			console.log('flags received', flags);
			for (var i = flags.length - 1; i >= 0; i--) {
				//if(!bases[flags[i].team - 1]){
					map.placeMarker(flags[i].uuid, flags[i].flag, 'Flag ' + flags[i].team, 'http://maps.google.com/mapfiles/kml/paddle/' + colors[flags[i].team - 1] + '-stars.png');
					map.placeCircle(flags[i].uuid, flags[i].base, colors[flags[i].team - 1]);
					bases[flags[i].team - 1] = true;
				//}
			
			}
		});
	}

	function showMap() {
		watchLocation(function (coords) {
			$('p.coords').html('Location: ' + coords.latitude + ',' + coords.longitude);
			user.location = coords.latitude + ',' + coords.longitude;
			//send your location to the server
			db.update('users', user._id.$oid, {
				location: user.location,
				date: new Date().toISOString()
			}, function (data) {
				console.log('Sent update to server.');
			});
			//get the other users
			refresh();
			//center on the user location
			if (user.location !== undefined) {
				var latlng = new google.maps.LatLng(user.location.split(",")[0], user.location.split(",")[1]);
				map.center(latlng);
			}
		}, function () {
			$('p.coords').html('error');
		}, {
			timeout: 0
		});
	}

	function placeFlag() {
		db.insert('flags', {
			flag: user.location,
			base: user.location,
			team: user.team,
			uuid: UUID(),
			date: new Date().toISOString()
		}, function (data) {
			console.log('Placed flag', data);
			$('button.placeflag').attr("disabled", true);
		});
	}

	//refresh on button press
	$('button.captureflag').click(function () {
		console.debug('Capture flag attempted');
	});
	$('button.placeflag').click(function () {
		placeFlag();
	});

});