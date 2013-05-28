//clear database
prompt = function(x,y){
	return "Danny";
}
//override navigator.geolocation
navigator.geolocation = function(coords){
	return coords;
}

//set location
navigator.geolocation(1,1);

// if captain click place flag
if(user.captain){
	$('.placeflag').click();
}

// navigate towards opponents flag
navigator.geolocation(1,2);

// if inbase(enemy) , pick up flag
if(inbase(enemy)){
	$('.captureflag').click();
}

// navigate towards base
navigator.geolocation(1,1);

// assert score
