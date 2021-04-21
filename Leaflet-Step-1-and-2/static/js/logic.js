//Get Data for last 30 Days of Earthquakes
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
//Get geoJSON for the tectonic plates
const plates = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'


d3.json(url).then((response) =>{

    d3.json(plates).then((plateinfo) =>  createEarthquakeMap(response,plateinfo))

});

function createEarthquakeMap(data,plates) {

    console.log(data)
    console.log(plates)
    //create the map object
    let myMap = MapObject();

    //create the base layers.baselayers is a dictionary/Object
    let baseLayers = createBaseLayers();

    //Create Legend
    let legend = createLegend();
    legend.addTo(myMap);

    //Create Markers for Earthquake Instances
    layers = createLayers(data,plates);
    markers = layers.markers
    heat = layers.heatmap
    tecplates = layers.platesdata

    //Create Overlay Maps
    var overlayMaps = {

        "Markers": markers,
        "Heatmap": heat,
        "Tectonic Plates": tecplates

    }


    //Add Default Layer
    myMap.addLayer(baseLayers["Dark Map"]);
    myMap.addLayer(overlayMaps.Markers)
    L.control.layers(baseLayers, overlayMaps, {
        collapsed: false
    }).addTo(myMap)   

    updateLegend(data);

}

function MapObject(){

    var centerCoords = [33.305542, -19.384108];
    var mapZoomLevel = 3;
    var myMap = L.map("mapid", {
      center: centerCoords,
      zoom: mapZoomLevel    
    });
    return myMap
}

function createBaseLayers(){

    var lightmap = L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "light-v10",
          accessToken: API_KEY,
        }
      );
    
    var darkmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY,
    }
    );

    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap
      };
      return baseMaps;
}

function createLayers(data,plates){
    //Create HeatMap Layer
    points = data.features.map((d) => [
        d.geometry.coordinates[1],
        d.geometry.coordinates[0],
        d.geometry.coordinates[2]
      ]);
      var heat = L.heatLayer(points, { radius: 25, blur: 15 });

     //Create Markers 
    markers=[]
    data.features.forEach(d =>{      

       markers.push(
        L.circleMarker([d.geometry.coordinates[1],d.geometry.coordinates[0]], {
            fillOpacity: 0.75,
            color: "gray",
            fillColor: color(d.geometry.coordinates[2]),
            weight: 0.2,
            // Adjust radius
            radius: d.properties.mag*1.5
        }).bindPopup(`<h4>${d.properties.place}</h4>
                    <hr>
                    <strong>Magnitud: </strong> ${d.properties.mag}<br>
                    <strong>Depth: </strong> ${d.geometry.coordinates[2]}`)
        
        )       

    }) 
    
    //Create Tectonic Plates Layer
    plateslayer = L.geoJson(plates)

    

    return {markers: L.layerGroup(markers), heatmap: heat, platesdata:plateslayer}


};

function color(mag){

  //Pick color of marker based on depth of  earthquake
  var color = "";

  if (mag > 500) {
    color = "#FF0D0D";
  }
  else if (mag> 400) {
    color = "#FF4E11";
  }
  else if (mag > 300) {
    color = "#FF8E15";
  }
  else if (mag > 200) {
    color = "#FAB733";
  }
  else if (mag > 100) {
    color = "#ACB334";
  }    
  else {
    color = "#69B34C";
  }

  return color

}

function createLegend() {
    let info = L.control({
      position: "bottomright",
    });
    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function () {
      let div = L.DomUtil.create("div", "legend");
      return div;
    };
    return info;
  }

  function updateLegend(data) {
    
    depths = data.features.map(d => d.geometry.coordinates[2])
    limits = [0,100,200,300,400,500]
    colors = ["#69B34C","#ACB334","#FAB733","#FF8E15","#FF4E11","#FF0D0D"]
    var labels = [];
    // console.log(Math.min.apply(Math,depths))
    limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });

    var html_legend = "<h1>Earthquake Surface Depth</h1>" +
    "<div class=\"labels\">" +
      "<div class=\"min\">" + Math.min.apply(Math,depths)+ "</div>" +
      "<div class=\"max\">" + Math.max.apply(Math,depths) + "</div>" +
      "<ul>" + labels.join("") + "</ul>"+
    "</div>";
  
  div = d3.selectAll('.legend').html(html_legend)
    
  
  }