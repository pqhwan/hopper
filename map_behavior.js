/* Needs this HTML on page (already on main.html):
		<script type="text/javascript"
			src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAfpiPiuq-tWzIRjRtYCFow5LY8YpRXMmk&sensor=true">
		</script>
*/

var map;
var partyLoc = new google.maps.LatLng(41.8238416,-71.3981711);

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