const interval = options.interval;

const shape = ({x: data[0].length, y: data.length});
const elevRange = d3.extent(data.flat());
const thresh = d3.range(Math.round(elevRange[0]/interval)*interval, elevRange[1], interval);

// Create a contour generator using d3.contours()
const contours = d3.contours()
    .size([shape.x, shape.y])
    .thresholds(thresh)
    (data.flat());

let colorScale;
// Create a color scale for the contour lines
if (options.color_choice === "blues") {
colorScale = d => d3.interpolateBlues((d-elevRange[0])/(elevRange[1]-elevRange[0]));
} else if (options.color_choice === "greens") {
colorScale = d => d3.interpolateGreens((d-elevRange[0])/(elevRange[1]-elevRange[0]));
} else if (options.color_choice === "reds") {
colorScale = d => d3.interpolateReds((d-elevRange[0])/(elevRange[1]-elevRange[0]));
} else {
colorScale = d => d3.interpolateViridis((d-elevRange[0])/(elevRange[1]-elevRange[0]));
}


function scaleContour(contours, scale) {
  return contours.map(({type, value, coordinates}) => (
    {type, value, coordinates: coordinates.map(rings => (
      rings.map(points => (
        points.map(([x, y]) => ([
          x*scale, y*scale
        ]))
      ))
    ))}
  ));
};

// Draw the contour lines
svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-opacity", "0.5")
  .selectAll("path")
  .data(scaleContour(contours, options.pixel_resolution))
  .join("path")
    .attr("fill", d => colorScale(d.value))
    .attr("d", d3.geoPath());
    
