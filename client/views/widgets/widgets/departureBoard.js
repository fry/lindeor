Template.departureBoard.helpers({
  busses: function () {
    return BusLines.find({}, { sort: { time: 1 } })
  },
})

Template.departureBoardBusLine.helpers({
  departure_time: function() {
    return moment(this.time).fromNow()
  }
})