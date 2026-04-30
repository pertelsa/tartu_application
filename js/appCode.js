let map = L.map('map', {
  center: [58.373523, 26.716045],
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
          fillOpacity: 0.5,
          weight: 1,
          opacity: 1,
          color: 'grey'
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
    case 1: return '#ff0000'
    case 13: return '#009933'
    case 6: return '#0000ff'
    case 7: return '#ff0066'
    default: return '#ffffff'
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
 
  districtsLayer.addTo(map)

  const overlayLayers = {
    "Tartu districts": districtsLayer,
    "Choropleth layer": choroplethLayer, 
    "Heatmap": heatMapLayer, 
    "Markers": markersLayer
  }

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

initializeLayers()



// default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
}


//zoomcontrol position
map.zoomControl.setPosition('topright')


//_________________________



