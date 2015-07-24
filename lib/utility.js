convertTime = function(time, date) {
  return moment(time + " " + date)
}

getLocalTime = function(serverTime, time) {
  return moment().add(time.diff(serverTime))
}

getDataTime = function(data) {
  if ("rtTime" in data)
    return convertTime(data.rtTime, data.rtDate)
  return convertTime(data.time, data.date)
}
