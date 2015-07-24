function parseComparisonPrice(str) {
  var comparison_regex = /Jfr(-|\s)pris (\d+(:(\d+|-))?)(-(\d+(:(\d+|-))))?\/(.+?)\./
  var md = comparison_regex.exec(str)
  if (md) {
    return util.format("%s /%s", md[2], md[9])
  }
}

function getCoopOffersPage(page) {
	var url = "https://www.coop.se/Services/PlainService.svc/JsonExecuteGet"
  var params = {
    pageGuid: "2b52901e-8ade-4b19-8e1f-aa910d6df79b",
    method: "GetAnonymousOfferPropositions",
    data: util.format("{\"page\": %d }", page)
  }

  var result = HTTP.get(url, { params: params })
  var comparison_regex = /Jfr-pris (\d+(:(\d+|-))?)(-(\d+(:(\d+|-))))?\/(.+?)\./

  return _.map(result.data, function(offer) {
    var comparison_price = parseComparisonPrice(offer.information) || offer.discount

    return {
      title: offer.title,
      oid: offer.oid,
      image_url: offer.imageUrl,
      info: offer.information,
      comparison_price: comparison_price,
      price: offer.discount
    }
  })
}

function getCoopOffers() {
  var offers = []
  var page = 0

  while (true) {
    var page_offers = getCoopOffersPage(page)
    page ++

    if (page_offers.length == 0)
      break

    offers = offers.concat(page_offers)
  }

  return offers
}

function getICAOffers() {
  var url = "https://api.ica.se/api/offers"
  var params = {
    Stores: 13582
  }

  var result = HTTP.get(url, { params: params })

  return _.map(result.data.Offers, function(offer) {
    var comparison_price = parseComparisonPrice(offer.PriceComparison) || offer.OfferCondition

    return {
      title: offer.ProductName,
      oid: offer.OfferId,
      image_url: offer.ImageUrl,
      info: offer.SizeOrQuantity,
      comparison_price: comparison_price,
      price: offer.OfferCondition
    }
  })
}

function mergeOffers(provider, offers) {
  var active_offers = []

  _.each(offers, function(offer) {
    active_offers.push(offer.oid)

    offer.expired = false
    offer.provider = provider

    Offers.upsert({
      provider: provider,
      oid: offer.oid
    }, offer)
  })

  Offers.update({
    provider: provider,
    oid: { $not: { $in: active_offers } }
  }, {
    $set: { expired: true }
  }, {
    multi: true
  })
}

Meteor.startup(function() {
  //Offers.remove({})

  mergeOffers("coop", getCoopOffers())
  mergeOffers("ica", getICAOffers())
})