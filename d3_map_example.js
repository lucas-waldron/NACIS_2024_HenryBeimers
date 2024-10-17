// Remove previous svg
svg.selectAll("g").remove();

// Transform data into json-style format
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
  
// Define zoom behavior
var zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", zoomed);
// Apply zoom behavior to the SVG
svg.call(zoom);

// Create a group to hold the map paths (this will help with zooming and panning)
var g = svg.append("g");


// Create the map
g.selectAll('path')
  .data(filteredData.features)
  .enter()
  .append('path')
  .attr('d', path)
  .attr('fill', d => {
    // check if estimate is valid, otherwise set to NA color
    return d.properties.estimate != null && !isNaN(d.properties.estimate) 
      ? colorScale(d.properties.estimate) 
      : options.na_color;
  })
  .on("mouseover", function(event, d) {
    // Show the tooltip on mouseover
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip.html("GEOID: " + d.properties.GEOID + "<br>Estimate: " + d.properties.estimate)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
    
    d3.select(this)
    .style("stroke", "black")
    .style("stroke-width", 1.5);
  })
  .on("mousemove", function(event) {
    // Move the tooltip with the mouse
    tooltip.style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function() {
    // Hide the tooltip on mouseout
    tooltip.transition().duration(200).style("opacity", 0);
    
    d3.select(this).style("stroke", "none");
  });
  
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
  // Make sure tooltip is in front of all other elements
  .style("z-index", "1000");

// Zoom function
function zoomed(event) {
  if (options.zoom === true) {
    g.attr("transform", event.transform);
  }  
}