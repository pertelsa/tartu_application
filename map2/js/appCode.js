let map = L.map('map', {
  center: [58.374, 26.715],
  zoom: 12,
  zoomControl: true 
})
//________________________
map.createPane('customDistrictPane')
map.getPane('customDistrictPane').style.zIndex = 390

//________________________
const esri_world= L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});
esri_world.addTo(map)

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS community',
  maxZoom: 19
})

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
})

//________________________
const baseLayers = {
  "ESRI World Map": esri_world,
  "Satellite": satelliteLayer,
  "Topographic": topoLayer
}



//________________________
let districtsLayer
let choroplethLayer
let heatMapLayer
let markersLayer



// Districts GeoJSON with styling
async function loadDistrictsLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson')
    const data = await response.json()
    
    districtsLayer = L.geoJson(data, {
      style: function(feature) {
        return {
          fillColor: getDistrictColor(feature.properties.OBJECTID),
          fillOpacity: 0.4,
          weight: 1,
          opacity: 1,
          color: 'black'
        }
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.NIMI || 'District ' + feature.properties.OBJECTID)
      },
      pane: 'customDistrictPane'
    })
  } catch (error) {
    console.error("Error loading districts data:", error)
  }
}

// function to color the layer 
function getDistrictColor(id) {
  switch (id) {
   // case 1: return '#ff0000'
    //case 13: return '#009933'
    //case 6: return '#0000ff'
    //case 7: return '#ff0066'
    default: return '#fdfdfd'
  }
}

// Choropleth layer
async function loadChoroplethLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson')
    const data = await response.json()
    
    choroplethLayer = L.choropleth(data, {
      valueProperty: 'OBJECTID',
      scale: ['#e6ffe6', '#004d00'],
      steps: 11,
      mode: 'q',
      style: {
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup('Value: ' + feature.properties.OBJECTID)
      },
      pane: 'customDistrictPane'
    })
  } catch (error) {
    console.error("Error loading choropleth data:", error)
  }
}

// Heat Map Layer
async function loadHeatMapLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()
    
    const heatData = data.features.map(function(feature) {
      return [
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        feature.properties.area || 1
      ]
    })
    
    heatMapLayer = L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17
      
    })

  } catch (error) {
    console.error("Error loading heatmap data:", error)
  }
}

// Cell Towers - Markers with Clusters
async function loadMarkersLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()
    
    const geoJsonLayer = L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: 'red',
          fillOpacity: 0.5,
          color: 'red',
          weight: 1,
          opacity: 1
        })
      },
      onEachFeature: function(feature, layer) {
        if (feature.properties) {
          layer.bindPopup('Cell Tower<br>Area: ' + (feature.properties.area || 'Unknown'))
        }
      }
    })
    
    markersLayer = L.markerClusterGroup()
    markersLayer.addLayer(geoJsonLayer)
  } catch (error) {
    console.error("Error loading markers data:", error)
  }
}

//________________________
async function initializeLayers() {
  await Promise.all([
    loadDistrictsLayer(),
    loadChoroplethLayer(),
    loadHeatMapLayer(),
    loadMarkersLayer()
  ])
 
  //districtsLayer.addTo(map)

  const overlayLayers = {
    "Tartu districts": districtsLayer,
    "Choropleth layer": choroplethLayer, 
    "Heatmap": heatMapLayer, 
    "Markers": markersLayer
  }

  // load WMS layers  
  loadWmsLayers(layers.wmsLayers, overlayLayers)

  const layerControlOptions = {
    collapsed: false,
    position: 'topleft'
  }

  const layerControl = L.control.layers(baseLayers, overlayLayers, layerControlOptions)
  esri_world.addTo(map) // Add default base layer
  layerControl.addTo(map)
  districtsLayer.addTo(map) 
  
  console.log(map)
}

//ERIENVATE KAARTIDE NÄITAMIISE FUKTSIOON
initializeLayers()



// default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
}


//zoomcontrol position
map.zoomControl.setPosition('topright')
// Make function globally accessible for onclick
window.defaultMapSettings = defaultMapSettings


//_________________________

//WMS LAYERS
import * as layers from "./layers.js"


// import TURF functions
import {turfFunctions} from "./turfPractice.js"

turfFunctions(map) // to use the function

//empty object to store the WMS layers and their active status
let activeWmsLayers = {}  
//console.log(activeWmsLayers)


//WMS LAYER LOADING FUNCTION
function loadWmsLayers(layersList, overlayLayers) {
  
  layersList.forEach(layer => {
    let paneName = `${layer.layers}-pane`
  map.createPane(paneName)
  map.getPane(paneName).style.zIndex = layer.zIndex
    let newLayer = L.tileLayer.wms(layer.url, {
      version: layer.version,
      layers: layer.layers,
      format: layer.format,
      transparent: layer.transparent,
      zIndex: layer.zIndex,
      pane: paneName
    })
    // add each layer to overlayLayers object to display them in layers list menu
    overlayLayers[layer.title.en] = newLayer
   // add each layer to an object of WMS layers
    activeWmsLayers[layer.layers] = false 


  })
}

map.on('overlayadd', 
(event) => {
  const layerId = event.layer.options.layers

  toggleActiveState(layerId, true)

  console.log(activeWmsLayers)
})


map.on('overlayremove', (event) => {
  const layerId = event.layer.options.layers

  toggleActiveState(layerId, false)

  console.log(activeWmsLayers)
})


function toggleActiveState(layerId, boolean) {
  // check if layer name's value is of type boolean, then we know this layer is present in the list
  if (typeof(activeWmsLayers[layerId]) == "boolean") {
    activeWmsLayers[layerId] = boolean // update the value to new one
  }
}





map.on('click', (event) => {
  // reset info window text on each click
const infoWindowContent = document.getElementById('info-content')
infoWindowContent.innerHTML = 
  Object.entries(activeWmsLayers).forEach(([key, value]) => {
    console.log(`key: ${key}, value: ${value}`)
    if (value === true) {
      const url = buildRequestUrl(
        event,
        'https://landscape-geoinformatics.ut.ee/geoserver/pa2023/wms?',

        key
              )
      fetchWmsData(url, key)
    }
  })
})



//FUNCTION TO BUILD WMS GETFEATUREINFO REQUEST URL
function buildRequestUrl(e, baseUrl, layerName) {
  // build a bounding box for the current map view
  const bounds = map.getBounds()
  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ].join(',')

  // get size values from map object
  const size = map.getSize()
  const sizeX = size.x
  const sizeY = size.y

  // get x and y points and round them to avoid strange errors
  const xPoint = Math.floor(e.containerPoint.x)
  const yPoint = Math.floor(e.containerPoint.y)

  // WMS endpoint and request parameters
  const wmsUrl = baseUrl
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    query_layers: layerName,
    layers: layerName,
    info_format: 'application/json',
    x: xPoint,
    y: yPoint,
    srs: 'EPSG:4326',
    width: sizeX,
    height: sizeY,
    bbox: `${bbox}`
  })

  return wmsUrl + params
}


//FUNCTION TO GET LAYER NAME
function getLayerName(layersList, layerName) {
  const layer = layersList.find(entry => entry.layers === layerName)
  return layer ? layer.title.en : layerName
}



//FUNCTION TO FETCH DATA FROM WMS GETFEATUREINFO REQUEST
function fetchWmsData(fullUrl, layerName) {
  //console.log('WMS URL:', fullUrl, 'layer:', layerName)
  fetch(fullUrl)
  .then(response => response.json())
  .then(data => {
// fetch the element that will hold the request data
const content = document.getElementById('info-content')
const layerTitle = getLayerName(layers.wmsLayers, layerName)
// condition that runs the code only if there is at least one feature in the results
if (data.features && data.features.length > 0) {
  const feature = data.features[0]
  const props = feature.properties
  // show the title of the layer
  let html = `<h4>${layerTitle}</h4><ul>`
  // show each entry in properties by looping through them
  for (const key in props) {
    // display properties as a list
    html += `<li><strong>${key}:</strong> ${props[key]}</li>`
  }
  // close the unordered list
  html += '</ul>'
  // update the content of the element by adding the new html
  content.innerHTML += html
} else {
  // fallback message to show
  content.innerHTML += `<em>No features found for ${layerTitle}</em><br>`
}
    
  })
  .catch(error => {
    console.error('Request failed:', error)
  })

}

document.getElementById('info-box').style.color = 'darkred'

document.getElementById('info-close').addEventListener('click', () => {
  // your event code goes here
  const infoWindowContent = document.getElementById('info-content')
  infoWindowContent.innerHTML = ''
})


