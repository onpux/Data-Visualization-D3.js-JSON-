// Artistic background: falling golden moons, purple mountains, moving white moon
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  }
  window.addEventListener('resize', resize);
  resize();
  // Falling golden crescent moons (medialunas)
  const moons = Array.from({length: 18}, () => ({
    x: -40 - Math.random()*60,
    y: -40 - Math.random()*H*0.5,
    r: 18 + Math.random()*22,
    dx: 0.7 + Math.random()*0.7,
    dy: 0.5 + Math.random()*0.7,
    phase: Math.random()*Math.PI*2
  }));
  // White moon
  let moonAngle = 0;
  function drawCrescentMoon(cx, cy, r) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI*0.15, Math.PI*1.85, false);
    ctx.arc(cx+r*0.45, cy-r*0.1, r*0.8, Math.PI*1.1, Math.PI*1.9, true);
    ctx.closePath();
    ctx.fillStyle = '#ffd700';
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function drawMountains() {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0,H*0.7);
    ctx.lineTo(W*0.18,H*0.55);
    ctx.lineTo(W*0.32,H*0.75);
    ctx.lineTo(W*0.5,H*0.6);
    ctx.lineTo(W*0.7,H*0.8);
    ctx.lineTo(W,H*0.65);
    ctx.lineTo(W,H);
    ctx.lineTo(0,H);
    ctx.closePath();
    ctx.fillStyle = '#4527a0';
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    drawMountains();
    // Falling golden crescent moons
    for(const m of moons) {
      drawCrescentMoon(m.x, m.y, m.r);
      m.x += m.dx;
      m.y += m.dy;
      if(m.x-m.r>W || m.y-m.r>H) {
        m.x = -40 - Math.random()*60;
        m.y = -40 - Math.random()*H*0.5;
        m.r = 18 + Math.random()*22;
      }
    }
    // Moving white moon
    const moonX = W*0.8 + Math.sin(moonAngle)*W*0.08;
    const moonY = H*0.18 + Math.cos(moonAngle)*H*0.03;
    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, 54, 0, 2*Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 60;
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
    moonAngle += 0.0015;
    requestAnimationFrame(draw);
  }
  draw();
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
