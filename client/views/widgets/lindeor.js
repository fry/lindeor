Template.body.helpers({
  trips: function() {
    return Session.get("busLines")
  },

  tripWatches: function() {
    return BusTripWatches.find({})
  },

  locationAutocompleteSettings: function() {
    return {
      position: "bottom",
      limit: 5,
      rules: [
        {
          token: '',
          collection: "StopLocations",
          field: "name",
          template: Template.stopLocationPill,
          filter: { track: null }
        },
      ]
    }
  }
});

Template.body.events({
  'submit #js-add-trip': function(event) {
    event.preventDefault()

    var origin = Session.get("addTripOrigin")
    var destination = Session.get("addTripDestination")

    if (!origin || !destination)
      return

    BusTripWatches.insert({
      origin: origin,
      destination: destination
    })

    $(event.target).find("[type=text]").val('')
  },
  'autocompleteselect #js-add-trip-origin': function(event, template, doc) {
    Session.set("addTripOrigin", doc)
  },
  'autocompleteselect #js-add-trip-destination': function(event, template, doc) {
    Session.set("addTripDestination", doc)
  },
})

Template.widgets.helpers({
  widgets: function() {
    return Widgets.find({})
  },
})

function setupWidget(container, widget, data) {
  widget.draggable({
    stop: function(event, ui) {
      var data = Blaze.getData(this)
      updateWidget(data, ui.position.left, ui.position.top, data.width, data.height)
    },
    grid: [20, 20]
  })

  widget.resizable({
    stop: function(event, ui) {
      var data = Blaze.getData(this)
      updateWidget(data, data.left, data.top, ui.size.width, ui.size.height)
    },
    grid: [20, 20]
  })
}

function updateWidget(data, x, y, width, height) {
  if (data.x !== x || data.y !== y || data.width === width || data.height === height) {
    console.log("update " + data._id + " x=" + x + ", y=" + y + ", w=" + width + ", h=" + height)
    Widgets.update(data._id, {
      $set: {
        x : x, y: y,
        width: width, height: height
      }
    })
  }
}

Template.widgets.onRendered(function() {
  console.log("rendered")
})

Template.widget.onRendered(function() {
  console.log("widget render")
  var widget = this.$(".widget")
  var container = $(widget.context)
  setupWidget(container, widget, this.data)
})

Template.busTrip.helpers({
  timeDep: function() {
    return moment(this.timeDep).format("HH:mm")
  },

  timeArr: function() {
    return moment(this.timeArr).format("HH:mm")
  },

  duration: function() {
    var mins = moment.duration(moment(this.timeArr) - moment(this.timeDep)).asMinutes()
    return Math.round(mins) + "m"
  },

  name: function() {
    return this.sname
  }
})

Template.tripWatch.helpers({
  trips: function() {
    var res = BusTrips.findOne({
      originId: this.origin.id,
      destinationId: this.destination.id
    })
    return res.trips
  }
})

function refreshTrips() {
  BusTripWatches.find({}).forEach(function(watch) {
    refreshTrip(watch.origin.id, watch.destination.id)
  })
}

function refreshTrip(originId, destinationId) {
  Meteor.call("getTrip", originId, destinationId, function(e, result) {
    BusTrips.upsert({
      originId: originId,
      destinationId: destinationId
    }, {
      originId: originId,
      destinationId: destinationId,
      trips: result
    })
  })
}

Meteor.startup(function() {
  //refreshTrips()
  //Meteor.setInterval(refreshTrips, 60000)
})