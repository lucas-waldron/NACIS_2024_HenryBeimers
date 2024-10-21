// Define the options object with necessary properties
var options = {
    geog: "tract", // Default geography level
    na_color: "gray", // Color for NA values
    zoom: true, // Enable zoom
    zoomThreshold: 4 // Define the zoom level threshold for switching to "cbg"
  };
  
  // Set dimensions for the SVG
  var width = 800;  // You can adjust this as needed
  var height = 600; // You can adjust this as needed
  
  // Append the SVG element to the div with ID "map"
  var svg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
  // Function to update the map based on the current geography level
  function updateMap() {
    // Load data and filter based on current geography
    d3.json("map_data.json").then(data => {
      var filteredData = {
        "type": "FeatureCollection",
        "features": data
          .filter(d => d.level === options.geog) // Filter to the selected geography
          .map(d => ({
            "type": "Feature",
            "geometry": d.geometry,
            "properties": {
              "GEOID": d.GEOID,
              "estimate": d.estimate,
              "level": d.level,
            }
          }))
      };
  
      // Define the D3 map projection
      var my_projection = d3.geoMercator().fitSize([width, height], filteredData);
      var path = d3.geoPath().projection(my_projection);
  
      // Create a blue color ramp for our target variable
      const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(filteredData.features, d => d.properties.estimate)]);
  
      // Remove existing paths before rendering new ones
      svg.selectAll("g").remove();
      var g = svg.append("g");
  
      // Create the map
      g.selectAll('path')
        .data(filteredData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', d => {
          return d.properties.estimate != null && !isNaN(d.properties.estimate) 
            ? colorScale(d.properties.estimate) 
            : options.na_color;
        })
        .on("mouseover", function(event, d) {
            const formattedEstimate = new Intl.NumberFormat().format(d.properties.estimate);
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html("GEOID: " + d.properties.GEOID + "<br>Estimate: $" + formattedEstimate)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
  
          d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", 1.5);
        })
        .on("mousemove", function(event) {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          tooltip.transition().duration(200).style("opacity", 0);
  
          d3.select(this).style("stroke", "none");
        });
  
      // Set up zoom behavior
      svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed));
    }).catch(error => {
      console.error("Error loading data:", error);
    });
  }
  
  // Initial map rendering
  updateMap();
  
  // Zoom function
  function zoomed(event) {
    const transform = event.transform;
    svg.selectAll("g").attr("transform", transform);
  
    // Check zoom level and update geography level if needed
    const zoomLevel = Math.round(transform.k);
    if (zoomLevel >= options.zoomThreshold && options.geog !== "cbg") {
      options.geog = "cbg"; // Switch to "cbg"
      updateMap(); // Re-render the map with new geography level
    } else if (zoomLevel < options.zoomThreshold && options.geog !== "tract") {
      options.geog = "tract"; // Switch back to "tract"
      updateMap(); // Re-render the map with new geography level
    }
  }
  
  // Add a tooltip div to the body
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background-color", "rgba(0, 0, 0, 0.6)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", "1000");