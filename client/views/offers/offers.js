Template.offers.helpers({
  offers: function() {
    return Offers.find({})
  }
})

Meteor.startup(function() {
})