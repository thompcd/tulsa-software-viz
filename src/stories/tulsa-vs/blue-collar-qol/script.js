import data from './data.json';

// Initialize Scrollama
const scroller = scrollama();

// Visualization state
let currentStep = 0;
let svg, width, height, margin;

// Data for visualizations
const salaries = [
  { job: 'Electrician', pay: 52400 },
  { job: 'HVAC Tech', pay: 49200 },
  { job: 'Truck Driver', pay: 48500 },
  { job: 'Machinist', pay: 46300 },
  { job: 'Welder', pay: 45800 },
  { job: 'Construction', pay: 38500 },
  { job: 'Production', pay: 36200 },
  { job: 'Warehouse', pay: 35800 }
];

const expenses = [
  { category: 'Transportation', percent: 39.6, color: '#f59e0b' },
  { category: 'Housing', percent: 31.9, color: '#3b82f6' },
  { category: 'Food', percent: 28.1, color: '#22c55e' },
  { category: 'Medical', percent: 22.3, color: '#ef4444' }
];

const housingComparison = [
  { city: 'Tulsa', amount: 14047, color: '#22c55e' },
  { city: 'National Avg', amount: 18161, color: '#ef4444' }
];

// Format helpers
const formatDollar = d3.format('$,.0f');
const formatPercent = d3.format('.1f');

// Initialize visualization
function initViz() {
  const container = document.getElementById('viz');
  const rect = container.getBoundingClientRect();
  
  margin = { top: 40, right: 40, bottom: 60, left: 120 };
  width = rect.width - margin.left - margin.right;
  height = rect.height - margin.top - margin.bottom;
  
  // Clear existing
  d3.select('#viz').selectAll('*').remove();
  
  svg = d3.select('#viz')
    .append('svg')
    .attr('width', rect.width)
    .attr('height', rect.height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
    
  // Show initial state
  showStep(1);
}

// Step handlers
function showStep(step) {
  currentStep = step;
  
  // Clear with transition
  svg.selectAll('*')
    .transition()
    .duration(300)
    .style('opacity', 0)
    .remove();
  
  // Small delay before showing new content
  setTimeout(() => {
    switch(step) {
      case 1:
        showIntro();
        break;
      case 2:
        showSalaries();
        break;
      case 3:
        showLivingWage();
        break;
      case 4:
        showGap();
        break;
      case 5:
      case 6:
        showExpensePie();
        break;
      case 7:
      case 8:
        showHousingComparison();
        break;
      case 9:
        showTwoIncome();
        break;
      case 10:
        showConclusion();
        break;
    }
  }, 350);
}

// Visualization: Intro
function showIntro() {
  const g = svg.append('g')
    .attr('class', 'intro')
    .style('opacity', 0);
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 - 40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#64748b')
    .attr('font-size', '1.5rem')
    .text('Blue Collar America');
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 20)
    .attr('text-anchor', 'middle')
    .attr('fill', '#3b82f6')
    .attr('font-size', '3rem')
    .attr('font-weight', '700')
    .text('Can It Still Work?');
  
  g.transition()
    .duration(600)
    .style('opacity', 1);
}

// Visualization: Salary Bars
function showSalaries() {
  const y = d3.scaleBand()
    .domain(salaries.map(d => d.job))
    .range([0, height])
    .padding(0.2);
  
  const x = d3.scaleLinear()
    .domain([0, 60000])
    .range([0, width]);
  
  // Y axis
  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y))
    .style('opacity', 0)
    .transition()
    .duration(600)
    .style('opacity', 1);
  
  // Bars
  const bars = svg.selectAll('.bar')
    .data(salaries)
    .enter()
    .append('g')
    .attr('class', 'bar-group');
  
  bars.append('rect')
    .attr('class', 'bar')
    .attr('y', d => y(d.job))
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('width', 0)
    .attr('fill', d => d.pay >= 44088 ? '#22c55e' : '#3b82f6')
    .attr('rx', 4)
    .transition()
    .duration(800)
    .delay((d, i) => i * 100)
    .attr('width', d => x(d.pay));
  
  bars.append('text')
    .attr('class', 'bar-value')
    .attr('y', d => y(d.job) + y.bandwidth() / 2)
    .attr('x', d => x(d.pay) + 10)
    .attr('dy', '0.35em')
    .text(d => formatDollar(d.pay))
    .style('opacity', 0)
    .transition()
    .duration(600)
    .delay((d, i) => i * 100 + 400)
    .style('opacity', 1);
  
  // Average line
  setTimeout(() => {
    svg.append('line')
      .attr('x1', x(44088))
      .attr('x2', x(44088))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 0)
      .transition()
      .duration(600)
      .style('opacity', 1);
    
    svg.append('text')
      .attr('x', x(44088) + 10)
      .attr('y', 20)
      .attr('fill', '#f59e0b')
      .attr('font-size', '12px')
      .text('Avg: $44,088')
      .style('opacity', 0)
      .transition()
      .duration(600)
      .style('opacity', 1);
  }, 1000);
}

// Visualization: Living Wage
function showLivingWage() {
  const g = svg.append('g').attr('class', 'living-wage');
  
  // Family icon placeholder
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 3)
    .attr('text-anchor', 'middle')
    .attr('font-size', '4rem')
    .text('👨‍👩‍👧‍👦')
    .style('opacity', 0)
    .transition()
    .duration(600)
    .style('opacity', 1);
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 20)
    .attr('text-anchor', 'middle')
    .attr('fill', '#94a3b8')
    .attr('font-size', '1rem')
    .text('Family of 4 needs')
    .style('opacity', 0)
    .transition()
    .delay(400)
    .duration(600)
    .style('opacity', 1);
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 70)
    .attr('text-anchor', 'middle')
    .attr('fill', '#ef4444')
    .attr('font-size', '3.5rem')
    .attr('font-weight', '800')
    .text('$79,924')
    .style('opacity', 0)
    .transition()
    .delay(800)
    .duration(600)
    .style('opacity', 1);
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 110)
    .attr('text-anchor', 'middle')
    .attr('fill', '#64748b')
    .attr('font-size', '1rem')
    .text('per year to cover basics')
    .style('opacity', 0)
    .transition()
    .delay(1200)
    .duration(600)
    .style('opacity', 1);
}

// Visualization: The Gap
function showGap() {
  const barData = [
    { label: 'Blue Collar Avg', value: 44088, color: '#3b82f6' },
    { label: 'Living Wage', value: 79924, color: '#ef4444' }
  ];
  
  const y = d3.scaleBand()
    .domain(barData.map(d => d.label))
    .range([height / 4, height * 3/4])
    .padding(0.4);
  
  const x = d3.scaleLinear()
    .domain([0, 90000])
    .range([0, width]);
  
  const bars = svg.selectAll('.gap-bar')
    .data(barData)
    .enter()
    .append('g');
  
  // Labels
  bars.append('text')
    .attr('x', 0)
    .attr('y', d => y(d.label) - 10)
    .attr('fill', '#94a3b8')
    .attr('font-size', '14px')
    .text(d => d.label);
  
  // Bars
  bars.append('rect')
    .attr('y', d => y(d.label))
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('width', 0)
    .attr('fill', d => d.color)
    .attr('rx', 4)
    .transition()
    .duration(1000)
    .attr('width', d => x(d.value));
  
  // Values
  bars.append('text')
    .attr('y', d => y(d.label) + y.bandwidth() / 2)
    .attr('x', d => x(d.value) + 10)
    .attr('dy', '0.35em')
    .attr('fill', '#fff')
    .attr('font-weight', '600')
    .text(d => formatDollar(d.value))
    .style('opacity', 0)
    .transition()
    .delay(800)
    .duration(600)
    .style('opacity', 1);
  
  // Gap arrow and label
  setTimeout(() => {
    const gapG = svg.append('g').attr('class', 'gap-indicator');
    
    gapG.append('line')
      .attr('x1', x(44088))
      .attr('x2', x(79924))
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#arrow)');
    
    gapG.append('text')
      .attr('x', x(44088) + (x(79924) - x(44088)) / 2)
      .attr('y', height / 2 - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f59e0b')
      .attr('font-size', '1.25rem')
      .attr('font-weight', '700')
      .text('Gap: $35,836');
    
    gapG.style('opacity', 0)
      .transition()
      .duration(600)
      .style('opacity', 1);
  }, 1200);
}

// Visualization: Expense Pie
function showExpensePie() {
  const radius = Math.min(width, height) / 2 - 40;
  
  const g = svg.append('g')
    .attr('transform', `translate(${width/2},${height/2})`);
  
  const pie = d3.pie()
    .value(d => d.percent)
    .sort(null);
  
  const arc = d3.arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius);
  
  const arcs = g.selectAll('.arc')
    .data(pie(expenses))
    .enter()
    .append('g')
    .attr('class', 'arc');
  
  arcs.append('path')
    .attr('fill', d => d.data.color)
    .attr('stroke', '#0a0a0a')
    .attr('stroke-width', 2)
    .transition()
    .duration(1000)
    .attrTween('d', function(d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return t => arc(i(t));
    });
  
  // Labels
  setTimeout(() => {
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(d => `${d.data.percent}%`)
      .style('opacity', 0)
      .transition()
      .duration(400)
      .style('opacity', 1);
  }, 1000);
  
  // Legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - 120}, 20)`);
  
  expenses.forEach((d, i) => {
    const row = legend.append('g')
      .attr('transform', `translate(0, ${i * 25})`);
    
    row.append('rect')
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', d.color)
      .attr('rx', 3);
    
    row.append('text')
      .attr('x', 24)
      .attr('y', 12)
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text(d.category);
  });
  
  // Total callout
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.2em')
    .attr('fill', '#ef4444')
    .attr('font-size', '2rem')
    .attr('font-weight', '800')
    .text('122%')
    .style('opacity', 0)
    .transition()
    .delay(1200)
    .duration(600)
    .style('opacity', 1);
  
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.2em')
    .attr('fill', '#94a3b8')
    .attr('font-size', '0.875rem')
    .text('of income')
    .style('opacity', 0)
    .transition()
    .delay(1400)
    .duration(600)
    .style('opacity', 1);
}

// Visualization: Housing Comparison
function showHousingComparison() {
  const y = d3.scaleBand()
    .domain(housingComparison.map(d => d.city))
    .range([height / 3, height * 2/3])
    .padding(0.4);
  
  const x = d3.scaleLinear()
    .domain([0, 20000])
    .range([0, width]);
  
  const bars = svg.selectAll('.housing-bar')
    .data(housingComparison)
    .enter()
    .append('g');
  
  // Labels
  bars.append('text')
    .attr('x', 0)
    .attr('y', d => y(d.city) - 10)
    .attr('fill', '#94a3b8')
    .attr('font-size', '14px')
    .text(d => d.city);
  
  // Bars
  bars.append('rect')
    .attr('y', d => y(d.city))
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('width', 0)
    .attr('fill', d => d.color)
    .attr('rx', 4)
    .transition()
    .duration(1000)
    .attr('width', d => x(d.amount));
  
  // Values
  bars.append('text')
    .attr('y', d => y(d.city) + y.bandwidth() / 2)
    .attr('x', d => x(d.amount) + 10)
    .attr('dy', '0.35em')
    .attr('fill', '#fff')
    .attr('font-weight', '600')
    .text(d => formatDollar(d.amount))
    .style('opacity', 0)
    .transition()
    .delay(800)
    .duration(600)
    .style('opacity', 1);
  
  // Savings callout
  setTimeout(() => {
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#22c55e')
      .attr('font-size', '1.5rem')
      .attr('font-weight', '700')
      .text('Save $4,114/year in Tulsa')
      .style('opacity', 0)
      .transition()
      .duration(600)
      .style('opacity', 1);
  }, 1200);
}

// Visualization: Two Income
function showTwoIncome() {
  const scenarios = [
    { label: 'Single Income', earned: 44088, needed: 79924, gap: 35836 },
    { label: 'Dual Income', earned: 88176, needed: 105352, gap: 17176 }
  ];
  
  const y = d3.scaleBand()
    .domain(scenarios.map(d => d.label))
    .range([height / 4, height * 3/4])
    .padding(0.3);
  
  const x = d3.scaleLinear()
    .domain([0, 120000])
    .range([0, width]);
  
  scenarios.forEach((scenario, i) => {
    const g = svg.append('g')
      .attr('transform', `translate(0, ${y(scenario.label)})`);
    
    // Label
    g.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('fill', '#fff')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text(scenario.label);
    
    // Earned bar
    g.append('rect')
      .attr('y', 0)
      .attr('x', 0)
      .attr('height', y.bandwidth() / 2 - 5)
      .attr('width', 0)
      .attr('fill', '#3b82f6')
      .attr('rx', 3)
      .transition()
      .duration(800)
      .delay(i * 200)
      .attr('width', x(scenario.earned));
    
    // Needed bar (outline)
    g.append('rect')
      .attr('y', y.bandwidth() / 2)
      .attr('x', 0)
      .attr('height', y.bandwidth() / 2 - 5)
      .attr('width', 0)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('rx', 3)
      .transition()
      .duration(800)
      .delay(i * 200 + 400)
      .attr('width', x(scenario.needed));
    
    // Gap label
    g.append('text')
      .attr('x', width)
      .attr('y', y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('fill', scenario.gap > 20000 ? '#ef4444' : '#f59e0b')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text(`Gap: ${formatDollar(scenario.gap)}`)
      .style('opacity', 0)
      .transition()
      .delay(i * 200 + 800)
      .duration(400)
      .style('opacity', 1);
  });
  
  // Legend
  const legend = svg.append('g')
    .attr('transform', `translate(0, ${height - 30})`);
  
  legend.append('rect')
    .attr('width', 16)
    .attr('height', 16)
    .attr('fill', '#3b82f6')
    .attr('rx', 3);
  
  legend.append('text')
    .attr('x', 24)
    .attr('y', 12)
    .attr('fill', '#94a3b8')
    .attr('font-size', '12px')
    .text('Earned');
  
  legend.append('rect')
    .attr('x', 100)
    .attr('width', 16)
    .attr('height', 16)
    .attr('fill', 'none')
    .attr('stroke', '#ef4444')
    .attr('stroke-width', 2)
    .attr('rx', 3);
  
  legend.append('text')
    .attr('x', 124)
    .attr('y', 12)
    .attr('fill', '#94a3b8')
    .attr('font-size', '12px')
    .text('Needed');
}

// Visualization: Conclusion
function showConclusion() {
  const g = svg.append('g').attr('class', 'conclusion');
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 3)
    .attr('text-anchor', 'middle')
    .attr('fill', '#22c55e')
    .attr('font-size', '4rem')
    .text('22%')
    .style('opacity', 0)
    .transition()
    .duration(600)
    .style('opacity', 1);
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 3 + 50)
    .attr('text-anchor', 'middle')
    .attr('fill', '#94a3b8')
    .attr('font-size', '1.25rem')
    .text('cheaper housing in Tulsa')
    .style('opacity', 0)
    .transition()
    .delay(400)
    .duration(600)
    .style('opacity', 1);
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#f59e0b')
    .attr('font-size', '1.5rem')
    .attr('font-weight', '600')
    .text('The math can work here.')
    .style('opacity', 0)
    .transition()
    .delay(800)
    .duration(600)
    .style('opacity', 1);
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 80)
    .attr('text-anchor', 'middle')
    .attr('fill', '#64748b')
    .attr('font-size', '1rem')
    .text('It just takes two paychecks.')
    .style('opacity', 0)
    .transition()
    .delay(1200)
    .duration(600)
    .style('opacity', 1);
}

// Scrollama setup
function setupScrollama() {
  scroller
    .setup({
      step: '.step',
      offset: 0.5,
      progress: true
    })
    .onStepEnter(response => {
      const step = parseInt(response.element.dataset.step);
      showStep(step);
    });
}

// Handle resize
function handleResize() {
  initViz();
  scroller.resize();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initViz();
  setupScrollama();
  window.addEventListener('resize', handleResize);
});
