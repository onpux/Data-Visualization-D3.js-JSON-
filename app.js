// app.js
// D3.js Data Visualization: Line chart, heatmap, world map

// --- 1. Global Temperature Evolution (Line Chart) ---
// Example: Fetching NASA GISTEMP data (anomalies) from a public JSON endpoint
// For demo, use a static array (can be replaced with fetch for real data)
const tempData = [
  { year: 1880, value: -0.2 },
  { year: 1900, value: -0.1 },
  { year: 1920, value: 0.0 },
  { year: 1940, value: 0.05 },
  { year: 1960, value: 0.1 },
  { year: 1980, value: 0.2 },
  { year: 2000, value: 0.5 },
  { year: 2020, value: 1.0 }
];

const svg1 = d3.select("#tempChart"),
  margin1 = {top: 30, right: 30, bottom: 40, left: 60},
  width1 = +svg1.attr("width") - margin1.left - margin1.right,
  height1 = +svg1.attr("height") - margin1.top - margin1.bottom;
const g1 = svg1.append("g").attr("transform",`translate(${margin1.left},${margin1.top})`);

const x1 = d3.scaleLinear().domain(d3.extent(tempData, d => d.year)).range([0, width1]);
const y1 = d3.scaleLinear().domain([d3.min(tempData, d => d.value)-0.1, d3.max(tempData, d => d.value)+0.1]).range([height1, 0]);

g1.append("g").attr("transform",`translate(0,${height1})`).call(d3.axisBottom(x1).tickFormat(d3.format("d")));
g1.append("g").call(d3.axisLeft(y1));

g1.append("path")
  .datum(tempData)
  .attr("fill", "none")
  .attr("stroke", "#a18cd1")
  .attr("stroke-width", 3)
  .attr("d", d3.line()
    .x(d => x1(d.year))
    .y(d => y1(d.value))
  );

g1.selectAll("circle")
  .data(tempData)
  .enter()
  .append("circle")
  .attr("cx", d => x1(d.year))
  .attr("cy", d => y1(d.value))
  .attr("r", 5)
  .attr("fill", "#6a0572")
  .append("title")
  .text(d => `${d.year}: ${d.value}°C`);

g1.append("text")
  .attr("x", width1/2)
  .attr("y", height1+35)
  .attr("text-anchor", "middle")
  .attr("fill", "#6a0572")
  .text("Year");
g1.append("text")
  .attr("x", -height1/2)
  .attr("y", -40)
  .attr("transform", "rotate(-90)")
  .attr("text-anchor", "middle")
  .attr("fill", "#6a0572")
  .text("Anomaly (°C)");

// --- 2. Timezone Heatmap (GitHub-style) ---
// Simulate 7 days x 24 hours
const days = 7, hours = 24;
const heatmap = d3.select("#heatmap");
const getColor = v => d3.interpolatePuRd(v); // purple scale
for (let d = 0; d < days; d++) {
  const row = heatmap.append("div").attr("class","heat-row");
  for (let h = 0; h < hours; h++) {
    const v = Math.random();
    row.append("div")
      .attr("class","heat-cell")
      .style("background", getColor(v))
      .append("title")
      .text(`Day ${d+1}, ${h}:00\nLevel: ${(v*100).toFixed(0)}%`);
  }
}

// --- 3. World Population by Country (Choropleth Map) ---
// Use a small sample of countries for demo; for real data, fetch from a public API
const worldSvg = d3.select("#worldMap"),
  width2 = +worldSvg.attr("width"),
  height2 = +worldSvg.attr("height");

Promise.all([
  d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json"),
  // Population data (static, could be fetched from API)
  Promise.resolve({
    "CHN": 1440, "IND": 1390, "USA": 332, "IDN": 276, "PAK": 225, "BRA": 213, "NGA": 211, "RUS": 146, "MEX": 128, "JPN": 125
  })
]).then(([world, popData]) => {
  const countries = topojson.feature(world, world.objects.countries).features;
  const projection = d3.geoMercator().fitSize([width2, height2], {type: "FeatureCollection", features: countries});
  const path = d3.geoPath().projection(projection);
  const popExtent = d3.extent(Object.values(popData));
  const color = d3.scaleSequential(d3.interpolatePuRd).domain(popExtent);

  worldSvg.selectAll("path")
    .data(countries)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", d => {
      const id = d.id;
      // ISO_A3 code mapping (simplified)
      const pop = popData[id];
      return pop ? color(pop) : "#eee";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .append("title")
    .text(d => `${d.properties.name || d.id}: ${popData[d.id] ? popData[d.id] + 'M' : 'No data'}`);
});
