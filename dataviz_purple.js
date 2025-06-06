// Artistic background: falling colorful spheres
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener('resize', resizeCanvas);

  // Spheres array
  const spheres = [];
  const sphereColors = ['#ffe6ff', '#fff176', '#b39ddb', '#ce93d8', '#fffde7'];
  function spawnSphere() {
    const r = 8 + Math.random() * 10;
    spheres.push({
      x: 30 + Math.random() * 80,
      y: -r,
      r,
      vy: 1.1 + Math.random() * 1.7,
      color: sphereColors[Math.floor(Math.random() * sphereColors.length)],
      alpha: 0.7 + Math.random() * 0.3
    });
  }

  function drawSpheres() {
    ctx.clearRect(0, 0, width, height);
    for (let s of spheres) {
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    }
  }

  function updateSpheres() {
    for (let s of spheres) {
      s.y += s.vy;
      s.x += 0.2 + Math.random() * 0.3; // drift right
    }
    // Remove spheres out of view
    while (spheres.length > 0 && spheres[0].y - spheres[0].r > height) {
      spheres.shift();
    }
  }

  function animate() {
    if (Math.random() < 0.13 && spheres.length < 32) spawnSphere();
    updateSpheres();
    drawSpheres();
    requestAnimationFrame(animate);
  }
  animate();
})();

// --- Project 1: US Minimum Wage Evolution (Line Chart) ---
// Data source: https://raw.githubusercontent.com/datasets/minimum-wage/master/data/minimum-wage.csv
// For demo, fetch a small sample CSV from a reliable source
(function() {
  d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/2011_us_ag_exports.csv').then(data => {
    // Simulate minimum wage data for demo
    const wageData = [
      {year: 2000, wage: 5.15},
      {year: 2005, wage: 5.15},
      {year: 2007, wage: 5.85},
      {year: 2008, wage: 6.55},
      {year: 2009, wage: 7.25},
      {year: 2015, wage: 7.25},
      {year: 2020, wage: 7.25},
      {year: 2024, wage: 7.25}
    ];
    const svg = d3.select('#wage-chart'),
      margin = {top: 30, right: 30, bottom: 40, left: 60},
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`);
    const x = d3.scaleLinear().domain([2000,2024]).range([0,width]);
    const y = d3.scaleLinear().domain([5,8]).range([height,0]);
    g.append('g').attr('transform',`translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format('d')));
    g.append('g').call(d3.axisLeft(y));
    g.append('path')
      .datum(wageData)
      .attr('fill','none')
      .attr('stroke','#ffd700')
      .attr('stroke-width',3)
      .attr('d',d3.line()
        .x(d=>x(d.year))
        .y(d=>y(d.wage))
      );
    g.selectAll('circle')
      .data(wageData)
      .enter().append('circle')
      .attr('cx',d=>x(d.year))
      .attr('cy',d=>y(d.wage))
      .attr('r',6)
      .attr('fill','#ffd700')
      .on('mouseover',function(e,d){
        d3.select(this).attr('fill','#fff');
        svg.append('text')
          .attr('id','wage-tooltip')
          .attr('x',x(d.year)+margin.left+10)
          .attr('y',y(d.wage)+margin.top-10)
          .attr('fill','#ffd700')
          .attr('font-size','1.1em')
          .text(`$${d.wage} in ${d.year}`);
      })
      .on('mouseout',function(){
        d3.select(this).attr('fill','#ffd700');
        svg.select('#wage-tooltip').remove();
      });
  });
})();

// --- Project 2: User Activity Heatmap (GitHub style) ---
// Data source: Simulated JSON
(function() {
  // Simulate activity data: days x hours
  const days = 7, hours = 24;
  const activity = [];
  for(let d=0;d<days;d++){
    for(let h=0;h<hours;h++){
      activity.push({day:d, hour:h, value:Math.floor(Math.random()*8)});
    }
  }
  const cellSize = 22, margin = {top:30,left:60},
    width = hours*cellSize+margin.left+20,
    height = days*cellSize+margin.top+30;
  const svg = d3.select('#heatmap-container')
    .append('svg')
    .attr('width',width)
    .attr('height',height);
  const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0,8]);
  svg.append('g')
    .selectAll('rect')
    .data(activity)
    .enter().append('rect')
    .attr('x',d=>margin.left+d.hour*cellSize)
    .attr('y',d=>margin.top+d.day*cellSize)
    .attr('width',cellSize-2)
    .attr('height',cellSize-2)
    .attr('rx',5)
    .attr('fill',d=>color(d.value))
    .on('mouseover',function(e,d){
      d3.select(this).attr('stroke','#ffd700').attr('stroke-width',2);
      svg.append('text')
        .attr('id','heat-tooltip')
        .attr('x',margin.left+d.hour*cellSize+10)
        .attr('y',margin.top+d.day*cellSize-8)
        .attr('fill','#ffd700')
        .attr('font-size','1em')
        .text(`${d.value} actions`);
    })
    .on('mouseout',function(){
      d3.select(this).attr('stroke','none');
      svg.select('#heat-tooltip').remove();
    });
  // Axis labels
  const daysLabel = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  svg.append('g').selectAll('text')
    .data(daysLabel)
    .enter().append('text')
    .attr('x',margin.left-10)
    .attr('y',(d,i)=>margin.top+i*cellSize+cellSize/1.5)
    .attr('text-anchor','end')
    .attr('fill','#fff')
    .attr('font-size','1em')
    .text(d=>d);
  svg.append('g').selectAll('text')
    .data(d3.range(hours))
    .enter().append('text')
    .attr('x',d=>margin.left+d*cellSize+cellSize/2)
    .attr('y',margin.top-8)
    .attr('text-anchor','middle')
    .attr('fill','#fff')
    .attr('font-size','0.9em')
    .text(d=>d);
})();

// --- Project 3: Stacked Bar Chart of Food Consumption (Alternative: Grouped Bar Chart, reliable data) ---
// Data: World Bank - Macronutrient supply by country (embedded sample)
(function() {
  // Sample data: country, carbs, fat, protein (grams per person per day)
  const foodData = [
    {country: 'United States', Carbs: 320, Fat: 160, Protein: 110},
    {country: 'France', Carbs: 290, Fat: 150, Protein: 105},
    {country: 'Brazil', Carbs: 340, Fat: 120, Protein: 95},
    {country: 'India', Carbs: 370, Fat: 80, Protein: 70},
    {country: 'China', Carbs: 350, Fat: 100, Protein: 90},
    {country: 'Nigeria', Carbs: 360, Fat: 70, Protein: 60},
    {country: 'Japan', Carbs: 300, Fat: 110, Protein: 95}
  ];
  const keys = ['Carbs','Fat','Protein'];
  const svg = d3.select('#food-bar-chart'),
    margin = {top: 30, right: 30, bottom: 60, left: 60},
    width = +svg.attr('width') - margin.left - margin.right,
    height = +svg.attr('height') - margin.top - margin.bottom;
  const g = svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`);
  const x0 = d3.scaleBand().domain(foodData.map(d=>d.country)).range([0,width]).padding(0.2);
  const x1 = d3.scaleBand().domain(keys).range([0,x0.bandwidth()]).padding(0.1);
  const y = d3.scaleLinear().domain([0,d3.max(foodData,d=>Math.max(d.Carbs,d.Fat,d.Protein))*1.2]).range([height,0]);
  const color = d3.scaleOrdinal().domain(keys).range(['#ffd700','#fff','#b39ddb']);
  g.append('g').attr('transform',`translate(0,${height})`).call(d3.axisBottom(x0)).selectAll('text').attr('fill','#4527a0').attr('font-size','1em').attr('transform','rotate(-20)').attr('text-anchor','end');
  g.append('g').call(d3.axisLeft(y));
  // Draw grouped bars
  g.selectAll('g.bar-group')
    .data(foodData)
    .enter().append('g')
    .attr('class','bar-group')
    .attr('transform',d=>`translate(${x0(d.country)},0)`)
    .selectAll('rect')
    .data(d=>keys.map(k=>({key:k,value:d[k],country:d.country})))
    .enter().append('rect')
    .attr('x',d=>x1(d.key))
    .attr('y',d=>y(d.value))
    .attr('width',x1.bandwidth())
    .attr('height',d=>height-y(d.value))
    .attr('fill',d=>color(d.key))
    .on('mouseover',function(e,d){
      d3.select(this).attr('stroke','#ffd700').attr('stroke-width',2);
      svg.append('text')
        .attr('id','bar-tooltip')
        .attr('x',x0(d.country)+x1(d.key)+margin.left+10)
        .attr('y',y(d.value)+margin.top-10)
        .attr('fill','#ffd700')
        .attr('font-size','1.1em')
        .text(`${d.country} - ${d.key}: ${d.value}g`);
    })
    .on('mouseout',function(){
      d3.select(this).attr('stroke','none');
      svg.select('#bar-tooltip').remove();
    });
  // Legend
  const legend = svg.append('g').attr('transform',`translate(${width+margin.left+10},${margin.top})`);
  keys.forEach((k,i)=>{
    legend.append('rect').attr('x',0).attr('y',i*28).attr('width',22).attr('height',22).attr('fill',color(k));
    legend.append('text').attr('x',30).attr('y',i*28+16).attr('fill','#4527a0').attr('font-size','1em').text(k);
  });
})();
