function addAllStops() {
	var url = "http://" + VASTTRAFIK_BASE_URL + "/location.allstops"
    var params = {
      authKey: VASTTRAFIK_AUTH_KEY,
      format: "json"
    }

    var result = HTTP.get(url, { params: params })
   	var stops = result.data.LocationList.StopLocation
    StopLocations.remove({})
    _.each(stops, function(stop) {
    	StopLocations.insert({
    		id: parseInt(stop.id),
    		name: stop.name,
    		track: stop.track,
    		lat: parseFloat(stop.lat),
    		lon: parseFloat(stop.lon)
    	})
    })
}

Meteor.startup(function () {
	if (StopLocations.find().count() == 0) {
		console.log("Bootstrap: Fetching all stops")
		addAllStops()
		console.log("Bootstrap: .. done")
	}

	Widgets.remove({})
	Widgets.insert({
		name: "Lindholmen stop",
		template: "departureBoard",
		x: 1,
		y: 1,
		width: 400,
		height: 300,
		data: {
			stopId: 9021014004490000
		}
	})

	Widgets.insert({
		name: "Lindholmen STOP 2",
		template: "departureBoard",
		x: 1,
		y: 1,
		width: 200,
		height: 200,
		data: {
			stopId: 9021014004490000
		}
	})
})