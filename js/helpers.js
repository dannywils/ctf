// Generate RFC4122 v4 UUID
// from http://stackoverflow.com/a/2117523
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