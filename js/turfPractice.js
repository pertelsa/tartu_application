import { pointsCollection } from "./points.js"

function turfFunctions(map) {
  console.log('This text is from a module')
  alert('Welcome to the Tartu Web Map application!')
  alert('This application is created by Aleksander Pertelson. The map includes various layers and features that demonstrate the capabilities of web mapping technologies. Please explore the map and feel free to provide feedback or report any issues you encounter. Enjoy your experience!')

  // add click event listener to the map
  // add click event listener to the map
  const clickLayer = L.layerGroup().addTo(map)

  map.on('click', function(event) {
    clickLayer.clearLayers()
    console.log(`[${event.latlng.lng}, ${event.latlng.lat}]`)
    // define coordinates of the point
    let pointCoords = [event.latlng.lng, event.latlng.lat]
    // create a turf point
    let turfPoint = turf.point(pointCoords)
    // convert the point to GeoJSON format and add it to the click layer


    // 🔵 tee ring (nt 50 m raadius)
    let circle = turf.buffer(turfPoint, 200, { units: 'meters' })

  // lisa klõpsatud ring kaardile
  L.geoJSON(circle, {
    style: {
      color: 'orange',
      fillOpacity: 0.3
    }
  }).addTo(clickLayer)

  //lisa klõpsatud punkt kaardile
    L.geoJSON(turfPoint
, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 1,
      color: 'red',
      fillColor: 'red',
      fillOpacity: 1
    });
  }
}).addTo(clickLayer)

})
// string interpolation
let string1 = 'hello'
let string2 = 'world'
//console.log(string1, string2, '!')
//console.log(`${string1} ${string2}!`)


//PUNKTID
  // define point coordinates
  const pointCoords1 = [26.71552, 58.37393]
  // define a point
  const myPoint1 = turf.point(pointCoords1)
  // convert the point to geoJSON object
  const geoJSON_point1 = L.geoJSON(myPoint1)
  // add the geoJSON object to the map
  geoJSON_point1.addTo(map)

  // teine punkt
const pointCoords2 = [26.71489, 58.37439]
const myPoint2 = turf.point(pointCoords2)
const geoJSON_point2 = L.geoJSON(myPoint2)
geoJSON_point2.addTo(map)

//kolmas punkt
const pointCoords3 = [26.712216, 58.37428]
const myPoint3 = turf.point(pointCoords3)
const geoJSON_point3 = L.geoJSON(myPoint3)
geoJSON_point3.addTo(map)

// punktide kogum
const points = turf.points(pointsCollection)
//L.geoJSON(points).addTo(map)

//POINT BUFFER
const statueBuffer = turf.buffer(myPoint1, 20, {units: 'meters'})
//L.geoJSON(statueBuffer).addTo(map)

//measuring distance between two points
const options = { units: 'meters' }

// replace point1 and point2 with the actual names you used to define your Turf points
const distance = turf.distance(myPoint1, myPoint2, options)
//console.log(`distance is ${distance} meters`)

// round the distance to nearest integer
const distanceRounded = Math.round(distance)
// distance is first multiplied by 100, then rounded and divided by 100 to keep two digits after the decimal point
const roundedToTwoDecimals = Math.round(distance*100)/100
// compare the results
//console.log(`rounded to nearest integer: ${distanceRounded}`)
//console.log(`rounded to two decimal points: ${roundedToTwoDecimals}`)



  // define line coordinates
  const lineCoords = [
  [26.71379, 58.37476],
  [26.71554, 58.37349],
  [26.71553, 58.37434],
  [26.71630, 58.37378],
  [26.71473, 58.37407]
]
  // define the line object
  const myLine = turf.lineString(lineCoords)
  // convert the line to geoJSON object
  const geoJSON_line = L.geoJSON(myLine)
  // add the geoJSON object to the map
  geoJSON_line.addTo(map)

  // LINE BUFFER
  const lineBuffer = turf.buffer(myLine, 20, {units: 'meters'})
//L.geoJSON(lineBuffer).addTo(map)
// define polygon coordinates
  const polygonCoords = [[
  [26.71355, 58.37468],
  [26.71404, 58.37430],
  [26.71433, 58.37429],
  [26.71550, 58.37345],
  [26.71660, 58.37388],
  [26.71615, 58.37420],
  [26.71589, 58.37431],
  [26.71552, 58.37461],
  [26.71521, 58.37496],
  [26.71480, 58.37481],
  [26.71449, 58.37502],
  [26.71355, 58.37468]
]]
// define polygon object
const myPolygon = turf.polygon(polygonCoords)
// convert the polygon to geoJSON object
const geoJSON_polygon = L.geoJSON(myPolygon)
// add the geoJSON object to the map
geoJSON_polygon.addTo(map)

// POLYGON BUFFER
const polygonBuffer = turf.buffer(myPolygon, -10, {units: 'meters'})
//L.geoJSON(polygonBuffer).addTo(map)

//polygon area measurement
const areaMeasurement = turf.area(myPolygon)
const areaRounded = Math.round(areaMeasurement)
//console.log(`Area without rounding: ${areaMeasurement}`)
//console.log(`Rounded area is ${areaRounded} square meters`)


//ENVELOPE
// create a feature collection
const features = turf.featureCollection([myPoint1, myPoint3, myLine, myPolygon])
// create the envelope
const enveloped = turf.envelope(features)
// add to map
L.geoJSON(enveloped).addTo(map)

//POINTS WITHIN POLYGON
const pointsWithinBorders = turf.pointsWithinPolygon(points, myPolygon)
// this should log an object that contains all the features within the park polygon
//console.log(pointsWithinBorders)
L.geoJSON(pointsWithinBorders).addTo(map)
}



export { turfFunctions }


