var STATION_ID = 9021014004490000

function getTrip(originId, destId) {
  var url = "http://" + VASTTRAFIK_BASE_URL + "/trip"
  var params = {
    authKey: VASTTRAFIK_AUTH_KEY,
    format: "json",
    originId: originId,
    destId: destId,
  }

  var result = HTTP.get(url, { params: params })
  var trip_list = result.data.TripList

  var server_time = convertTime(trip_list.servertime, trip_list.serverdate)
  
  var trips_result = []

  var trips = trip_list.Trip

  for (var i=0; i<trips.length; i++) {
    var leg = [].concat(trips[i].Leg)
    
    var leg_origin = leg[0].Origin
    var leg_dest = leg[leg.length - 1].Destination

    var time_dep = getLocalTime(server_time, getDataTime(leg_origin))
    var time_arr = getLocalTime(server_time, getDataTime(leg_dest))

    var data_trip = {
      origin: leg_origin.name,
      dest: leg_dest.name,
      timeDep: time_dep.toDate(),
      timeArr: time_arr.toDate(),
      steps: []
    }

    for (var j=0; j<leg.length; j++) {
      var step = leg[j]

      if (step.type === "WALK" && step.Origin.name === step.Destination.name)
        continue

      data_trip.steps.push({
        type: step.type,
        name: step.name,
        sname: step.sname,
        fgColor: step.fgColor,
        bgColor: step.bgColor
      })
    }

    trips_result.push(data_trip)
  }

  return trips_result
}

Meteor.methods({
  getTrip: getTrip
})

function refreshBusses() {
  var url = "http://" + VASTTRAFIK_BASE_URL + "/departureBoard"
  var params = {
   authKey: VASTTRAFIK_AUTH_KEY,
   format: "json",
   id: STATION_ID,
   timeSpan: 60,
   maxDeparturesPerLine: 1,
   needJourneyDetail: 0
  }

  var result = HTTP.get(url, { params: params })
  dpb = result.data.DepartureBoard

  var server_time = convertTime(dpb.servertime, dpb.serverdate)

  var journey_ids = []
  var deps = dpb.Departure
  for (var i=0; i<deps.length; i++) {
    var dep = deps[i]
    var dep_time = getDataTime(dep)
    var dep_local_time = getLocalTime(server_time, dep_time)

    BusLines.upsert(
    {
      journeyId: dep.journeyid
    },
    {
      journeyId: dep.journeyid,
      name: dep.name,
      time: dep_local_time.toDate(),
      track: dep.track,
      direction: dep.direction
    })
    journey_ids.push(dep.journeyid)
  }

  BusLines.remove({
    journeyId: {$not: {$in: journey_ids}}
  })
}

Meteor.startup(function () {
  BusLines.remove({})
  //refreshBusses()
  //getTrip(STATION_ID, 9021014006160000)
  //getTrip(STATION_ID, 9021014004680000)

  //Meteor.setInterval(refreshBusses, 5000)
});


