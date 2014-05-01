/* Needs this HTML on page (already on main.html):
		<script type="text/javascript"
			src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAfpiPiuq-tWzIRjRtYCFow5LY8YpRXMmk&sensor=true">
		</script>
*/

var map;
var partyLoc = new google.maps.LatLng(41.8238416,-71.3981711);
var geocoder = new google.maps.Geocoder();

function placePin(location) {
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		title: "Party here"
	});

	// Can also leave out map, will create marker
	// but won't place it. Add it to map later with
	// marker.setMap(map);
}

placePin(partyLoc);



function codeLatLng(party_latlng) {
	// party_latlng is a LatLng object (like partyLoc here)
	geocoder.geocode({'latLng': party_latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[1]) {
				alert(results[1].formatted_address);
				// results[1].formatted_address is a string.
				// see documentation for other things returned in "results"
			}
		} else {
			alert("Geocoder failed due to: " + status);
		}
	});
}

codeLatLng(partyLoc);


var newPartyLoc;

function codeAddress(address) {
	// address is a string, just like you would type into google maps
	geocoder.geocode({'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			newPartyLoc = results[0].geometry.location;
			// this gives a LatLng object
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

codeAddress("69 Brown St, Providence RI");