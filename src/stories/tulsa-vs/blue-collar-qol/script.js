import * as d3 from 'd3';
import scrollama from 'scrollama';
import data from './data.json';

// ============================================
// Tulsa vs Blue Collar — Scrollytelling Visualizations
// Using interrupt-safe animation patterns from Tulsa vs Austin
// ============================================

const COLORS = {
  good: '#22c55e',
  bad: '#ef4444',
  primary: '#3b82f6',
  accent: '#f59e0b',
  text: '#f5f5f5',
  textLight: '#94a3b8',
  textMuted: '#64748b',
  border: 'rgba(255, 255, 255, 0.1)',
  bg: '#0a0a0a',
};

const fmt = {
  dollar: d3.format('$,.0f'),
  dollarK: (v) => `$${d3.format(',.0f')(v / 1000)}K`,
  percent: d3.format('.1f'),
  comma: d3.format(','),
};

// Salary data
const salaries = [
  { job: 'Electrician', pay: 52400 },
  { job: 'HVAC Tech', pay: 49200 },
  { job: 'Truck Driver', pay: 48500 },
  { job: 'Machinist', pay: 46300 },
  { job: 'Welder', pay: 45800 },
  { job: 'Construction', pay: 38500 },
  { job: 'Production', pay: 36200 },
  { job: 'Warehouse', pay: 35800 },
];

const expenses = [
  { category: 'Transportation', percent: 39.6, color: COLORS.accent },
  { category: 'Housing', percent: 31.9, color: COLORS.primary },
  { category: 'Food', percent: 28.1, color: COLORS.good },
  { category: 'Medical', percent: 22.3, color: COLORS.bad },
];

// ── Utility ──────────────────────────
function getChartDimensions(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return { width: 600, height: 400, margin: { top: 60, right: 40, bottom: 50, left: 100 } };
  const rect = container.getBoundingClientRect();
  const width = Math.min(rect.width || 600, 700);
  const height = Math.min(rect.height || 400, 500);
  return {
    width,
    height,
    margin: { top: 60, right: 40, bottom: 50, left: 100 },
  };
}

// Helper: Interrupt-safe animation
// Sets final state FIRST (safety net), then animates from start
function animateBar(selection, attr, endValFn, duration = 800) {
  selection.interrupt();
  selection.each(function(d, i) {
    const el = d3.select(this);
    const startVal = parseFloat(el.attr(attr)) || 0;
    const endVal = typeof endValFn === 'function' ? endValFn(d, i) : endValFn;
    // Set end state immediately (safety net)
    el.attr(attr, endVal);
    // Then animate from start
    if (Math.abs(startVal - endVal) > 1) {
      el.attr(attr, startVal)
        .transition().duration(duration).ease(d3.easeCubicOut)
        .attr(attr, endVal);
    }
  });
}

// ── Chart 1: Salary Bars ──────────────────────────
function createSalaryChart() {
  const containerId = 'chart-salary';
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const { width, height, margin } = getChartDimensions(containerId);
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', margin.left)
    .attr('y', 24)
    .text('Blue Collar Salaries in Tulsa');

  svg.append('text')
    .attr('class', 'chart-subtitle')
    .attr('x', margin.left)
    .attr('y', 42)
    .text('Annual wages by occupation, BLS 2024');

  // Scales
  const y = d3.scaleBand()
    .domain(salaries.map(d => d.job))
    .range([0, innerH])
    .padding(0.25);

  const x = d3.scaleLinear()
    .domain([0, 60000])
    .range([0, innerW]);

  // Grid lines
  x.ticks(5).forEach(tick => {
    g.append('line')
      .attr('class', 'grid-line')
      .attr('x1', x(tick)).attr('x2', x(tick))
      .attr('y1', 0).attr('y2', innerH);
  });

  // Y axis labels
  g.selectAll('.bar-label')
    .data(salaries)
    .join('text')
    .attr('class', 'bar-label')
    .attr('x', -8)
    .attr('y', d => y(d.job) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .text(d => d.job);

  // Bars (start at 0)
  g.selectAll('.bar')
    .data(salaries)
    .join('rect')
    .attr('class', 'bar')
    .attr('y', d => y(d.job))
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('width', 0)
    .attr('rx', 3)
    .attr('fill', d => d.pay >= 44088 ? COLORS.good : COLORS.primary);

  // Value labels
  g.selectAll('.bar-value')
    .data(salaries)
    .join('text')
    .attr('class', 'bar-value')
    .attr('y', d => y(d.job) + y.bandwidth() / 2)
    .attr('x', 5)
    .attr('dy', '0.35em')
    .attr('opacity', 0);

  window._salaryChart = { g, x, y, innerW, innerH, svg };
}

function updateSalaryChart(step) {
  const chart = window._salaryChart;
  if (!chart) return;
  const { g, x, innerH } = chart;
  const avg = 44088;

  if (step === 'salary-1') {
    // Intro - no bars yet
    g.selectAll('.bar').interrupt().attr('width', 0);
    g.selectAll('.bar-value').interrupt().attr('opacity', 0);
    g.selectAll('.avg-line').remove();
    g.selectAll('.living-wage').remove();

  } else if (step === 'salary-2') {
    // Show salary bars
    g.selectAll('.living-wage').remove();
    
    animateBar(g.selectAll('.bar'), 'width', (d) => x(d.pay));

    g.selectAll('.bar-value')
      .interrupt()
      .text(d => fmt.dollar(d.pay))
      .attr('x', d => x(d.pay) + 8)
      .transition().duration(600).delay(400)
      .attr('opacity', 1);

    // Average line
    g.selectAll('.avg-line').remove();
    const avgG = g.append('g').attr('class', 'avg-line');
    avgG.append('line')
      .attr('x1', x(avg)).attr('x2', x(avg))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', COLORS.accent)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3');
    avgG.append('text')
      .attr('x', x(avg))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.accent)
      .attr('font-size', '11px')
      .text(`Avg: ${fmt.dollar(avg)}`);

  } else if (step === 'salary-3') {
    // Show living wage line
    const livingWage = 79924;
    
    g.selectAll('.living-wage').remove();
    const lwG = g.append('g').attr('class', 'living-wage');
    
    // Living wage is off the chart, show it at edge
    const lwX = Math.min(x(livingWage), x(60000));
    
    lwG.append('line')
      .attr('x1', lwX).attr('x2', lwX)
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', COLORS.bad)
      .attr('stroke-width', 3)
      .attr('opacity', 0)
      .transition().duration(600)
      .attr('opacity', 1);
    
    lwG.append('text')
      .attr('x', lwX - 5)
      .attr('y', -10)
      .attr('text-anchor', 'end')
      .attr('fill', COLORS.bad)
      .attr('font-size', '11px')
      .attr('opacity', 0)
      .transition().duration(600).delay(300)
      .attr('opacity', 1)
      .text(`Living wage: ${fmt.dollar(livingWage)} →`);
  }
}

// ── Chart 2: The Gap ──────────────────────────
function createGapChart() {
  const containerId = 'chart-gap';
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const { width, height, margin } = getChartDimensions(containerId);
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', margin.left)
    .attr('y', 24)
    .text('The Gap');

  svg.append('text')
    .attr('class', 'chart-subtitle')
    .attr('x', margin.left)
    .attr('y', 42)
    .text('What you earn vs what you need');

  window._gapChart = { svg, g, innerW, innerH, margin, width, height };
}

function updateGapChart(step) {
  const chart = window._gapChart;
  if (!chart) return;
  const { g, innerW, innerH, svg } = chart;

  if (step === 'gap-1') {
    g.selectAll('*').remove();

    // Horizontal bar comparison
    const gapData = [
      { label: 'Blue Collar Avg', value: 44088, color: COLORS.primary },
      { label: 'Living Wage', value: 79924, color: COLORS.bad },
    ];

    const y = d3.scaleBand()
      .domain(gapData.map(d => d.label))
      .range([innerH * 0.25, innerH * 0.75])
      .padding(0.4);

    const x = d3.scaleLinear()
      .domain([0, 90000])
      .range([0, innerW]);

    // Labels
    g.selectAll('.gap-label')
      .data(gapData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', -8)
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(d => d.label);

    // Bars
    const bars = g.selectAll('.gap-bar')
      .data(gapData)
      .join('rect')
      .attr('class', 'gap-bar')
      .attr('y', d => y(d.label))
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color);

    animateBar(bars, 'width', d => x(d.value));

    // Values
    g.selectAll('.gap-value')
      .data(gapData)
      .join('text')
      .attr('class', 'bar-value')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('x', d => x(d.value) + 10)
      .attr('opacity', 0)
      .transition().duration(600).delay(600)
      .attr('opacity', 1)
      .text(d => fmt.dollar(d.value));

    // Gap annotation
    setTimeout(() => {
      const gapG = g.append('g').attr('class', 'gap-annotation');
      const y1 = y('Blue Collar Avg') + y.bandwidth();
      const y2 = y('Living Wage');
      const midY = (y1 + y2) / 2;

      gapG.append('line')
        .attr('x1', x(44088)).attr('x2', x(79924))
        .attr('y1', midY).attr('y2', midY)
        .attr('stroke', COLORS.accent)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,3');

      gapG.append('text')
        .attr('x', x((44088 + 79924) / 2))
        .attr('y', midY - 10)
        .attr('text-anchor', 'middle')
        .attr('class', 'annotation')
        .text('Gap: $35,836');
    }, 1000);

    svg.select('.chart-title').text('The Gap');
    svg.select('.chart-subtitle').text('What you earn vs what you need');

  } else if (step === 'gap-2' || step === 'gap-3') {
    g.selectAll('*').remove();

    // Pie chart of expenses
    const radius = Math.min(innerW, innerH) / 2 - 20;
    const pieG = g.append('g')
      .attr('transform', `translate(${innerW/2},${innerH/2})`);

    const pie = d3.pie()
      .value(d => d.percent)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const arcs = pieG.selectAll('.arc')
      .data(pie(expenses))
      .join('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('fill', d => d.data.color)
      .attr('stroke', COLORS.bg)
      .attr('stroke-width', 2)
      .transition().duration(1000)
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
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(d => `${d.data.percent}%`);
    }, 800);

    // Center text
    if (step === 'gap-3') {
      setTimeout(() => {
        pieG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-0.2em')
          .attr('fill', COLORS.bad)
          .attr('font-size', '2rem')
          .attr('font-weight', '800')
          .text('122%');
        pieG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '1.5em')
          .attr('fill', COLORS.textMuted)
          .attr('font-size', '0.75rem')
          .text('of income needed');
      }, 1200);
    }

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerW - 100}, 20)`);

    expenses.forEach((d, i) => {
      const row = legend.append('g')
        .attr('transform', `translate(0, ${i * 22})`);
      row.append('rect')
        .attr('width', 14).attr('height', 14)
        .attr('fill', d.color).attr('rx', 2);
      row.append('text')
        .attr('x', 20).attr('y', 11)
        .attr('fill', COLORS.textLight)
        .attr('font-size', '11px')
        .text(d.category);
    });

    svg.select('.chart-title').text('Where the Paycheck Goes');
    svg.select('.chart-subtitle').text('Expenses as % of $44,088 salary');
  }
}

// ── Chart 3: Housing Comparison ──────────────────────────
function createHousingChart() {
  const containerId = 'chart-housing';
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const { width, height, margin } = getChartDimensions(containerId);
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', margin.left)
    .attr('y', 24)
    .text('Tulsa\'s Housing Advantage');

  svg.append('text')
    .attr('class', 'chart-subtitle')
    .attr('x', margin.left)
    .attr('y', 42)
    .text('Annual housing costs, family of 4');

  window._housingChart = { svg, g, innerW, innerH, margin, width, height };
}

function updateHousingChart(step) {
  const chart = window._housingChart;
  if (!chart) return;
  const { g, innerW, innerH, svg } = chart;

  const housingData = [
    { city: 'Tulsa', amount: 14047, color: COLORS.good },
    { city: 'National', amount: 18161, color: COLORS.bad },
  ];

  if (step === 'housing-1' || step === 'housing-2') {
    g.selectAll('*').remove();

    const x = d3.scaleBand()
      .domain(housingData.map(d => d.city))
      .range([0, innerW])
      .padding(0.35);

    const y = d3.scaleLinear()
      .domain([0, 20000])
      .range([innerH, 0]);

    // Grid
    y.ticks(5).forEach(tick => {
      g.append('line').attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick));
      g.append('text').attr('class', 'axis-label')
        .attr('x', -10).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .text(fmt.dollarK(tick));
    });

    // Bars
    const bars = g.selectAll('.housing-bar')
      .data(housingData)
      .join('rect')
      .attr('class', 'housing-bar')
      .attr('x', d => x(d.city))
      .attr('width', x.bandwidth())
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .attr('y', innerH)
      .attr('height', 0);

    bars.each(function(d) {
      const el = d3.select(this);
      const finalY = y(d.amount);
      const finalH = innerH - y(d.amount);
      el.attr('y', finalY).attr('height', finalH);
      el.attr('y', innerH).attr('height', 0)
        .transition().duration(800).ease(d3.easeCubicOut)
        .attr('y', finalY).attr('height', finalH);
    });

    // Labels
    g.selectAll('.housing-label')
      .data(housingData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', innerH + 25)
      .attr('text-anchor', 'middle')
      .text(d => d.city);

    // Values
    g.selectAll('.housing-value')
      .data(housingData)
      .join('text')
      .attr('class', 'bar-value')
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', d => y(d.amount) - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.color)
      .attr('opacity', 0)
      .transition().duration(600).delay(500)
      .attr('opacity', 1)
      .text(d => fmt.dollar(d.amount));

    // Savings callout
    if (step === 'housing-2') {
      setTimeout(() => {
        g.append('text')
          .attr('class', 'annotation')
          .attr('x', innerW / 2)
          .attr('y', y(18500))
          .attr('text-anchor', 'middle')
          .attr('opacity', 0)
          .transition().duration(600)
          .attr('opacity', 1)
          .text('Save $4,114/year (22.7%)');
      }, 1000);
    }
  }
}

// ── Chart 4: Two-Income Solution ──────────────────────────
function createSolutionChart() {
  const containerId = 'chart-solution';
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const { width, height, margin } = getChartDimensions(containerId);
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', margin.left)
    .attr('y', 24)
    .text('The Two-Income Solution');

  svg.append('text')
    .attr('class', 'chart-subtitle')
    .attr('x', margin.left)
    .attr('y', 42)
    .text('How the math changes');

  window._solutionChart = { svg, g, innerW, innerH, margin, width, height };
}

function updateSolutionChart(step) {
  const chart = window._solutionChart;
  if (!chart) return;
  const { g, innerW, innerH, svg } = chart;

  const scenarios = [
    { label: 'Single Income', earned: 44088, needed: 79924 },
    { label: 'Dual Income', earned: 88176, needed: 105352 },
  ];

  if (step === 'solution-1') {
    g.selectAll('*').remove();

    const y = d3.scaleBand()
      .domain(scenarios.map(d => d.label))
      .range([innerH * 0.15, innerH * 0.85])
      .padding(0.35);

    const x = d3.scaleLinear()
      .domain([0, 120000])
      .range([0, innerW]);

    scenarios.forEach((scenario, i) => {
      const rowG = g.append('g')
        .attr('transform', `translate(0, ${y(scenario.label)})`);

      // Label
      rowG.append('text')
        .attr('x', -8)
        .attr('y', y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('fill', COLORS.textLight)
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(scenario.label);

      // Earned bar
      const earnedBar = rowG.append('rect')
        .attr('y', 0)
        .attr('x', 0)
        .attr('height', y.bandwidth() * 0.45)
        .attr('width', 0)
        .attr('fill', COLORS.primary)
        .attr('rx', 3);

      earnedBar.attr('width', x(scenario.earned))
        .attr('width', 0)
        .transition().duration(800).delay(i * 200)
        .attr('width', x(scenario.earned));

      // Needed bar (outline)
      const neededBar = rowG.append('rect')
        .attr('y', y.bandwidth() * 0.55)
        .attr('x', 0)
        .attr('height', y.bandwidth() * 0.45)
        .attr('width', 0)
        .attr('fill', 'none')
        .attr('stroke', COLORS.bad)
        .attr('stroke-width', 2)
        .attr('rx', 3);

      neededBar.attr('width', x(scenario.needed))
        .attr('width', 0)
        .transition().duration(800).delay(i * 200 + 300)
        .attr('width', x(scenario.needed));

      // Gap label
      const gap = scenario.needed - scenario.earned;
      rowG.append('text')
        .attr('x', innerW)
        .attr('y', y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('fill', gap > 30000 ? COLORS.bad : COLORS.accent)
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .attr('opacity', 0)
        .transition().delay(i * 200 + 600).duration(400)
        .attr('opacity', 1)
        .text(`Gap: ${fmt.dollar(gap)}`);
    });

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(0, ${innerH - 15})`);

    legend.append('rect')
      .attr('width', 14).attr('height', 14)
      .attr('fill', COLORS.primary).attr('rx', 2);
    legend.append('text')
      .attr('x', 20).attr('y', 11)
      .attr('fill', COLORS.textLight)
      .attr('font-size', '11px')
      .text('Earned');

    legend.append('rect')
      .attr('x', 90).attr('width', 14).attr('height', 14)
      .attr('fill', 'none').attr('stroke', COLORS.bad)
      .attr('stroke-width', 2).attr('rx', 2);
    legend.append('text')
      .attr('x', 110).attr('y', 11)
      .attr('fill', COLORS.textLight)
      .attr('font-size', '11px')
      .text('Needed');

  } else if (step === 'solution-2') {
    g.selectAll('*').remove();

    // Final message
    const centerY = innerH / 2;

    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', centerY - 50)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.good)
      .attr('font-size', '4rem')
      .attr('font-weight', '800')
      .attr('opacity', 0)
      .transition().duration(800)
      .attr('opacity', 1)
      .text('22%');

    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', centerY + 10)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.textLight)
      .attr('font-size', '1.25rem')
      .attr('opacity', 0)
      .transition().delay(400).duration(600)
      .attr('opacity', 1)
      .text('cheaper housing in Tulsa');

    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', centerY + 60)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.accent)
      .attr('font-size', '1rem')
      .attr('font-weight', '600')
      .attr('opacity', 0)
      .transition().delay(800).duration(600)
      .attr('opacity', 1)
      .text('The math can work here.');

    svg.select('.chart-title').text('The Bottom Line');
    svg.select('.chart-subtitle').text('');
  }
}

// ── Initialize Scrollama ──────────────────────────
function initScrollama() {
  const sections = [
    { id: 'scrolly-salary', createChart: createSalaryChart, updateChart: updateSalaryChart },
    { id: 'scrolly-gap', createChart: createGapChart, updateChart: updateGapChart },
    { id: 'scrolly-housing', createChart: createHousingChart, updateChart: updateHousingChart },
    { id: 'scrolly-solution', createChart: createSolutionChart, updateChart: updateSolutionChart },
  ];

  const isMobile = window.innerWidth <= 900;

  sections.forEach(section => {
    section.createChart();

    // Pre-render first step so charts are visible on load
    const firstStep = document.querySelector(`#${section.id} .step`);
    if (firstStep) {
      section.updateChart(firstStep.dataset.step);
      firstStep.classList.add('is-active');
    }

    const scroller = scrollama();
    scroller
      .setup({
        step: `#${section.id} .step`,
        offset: isMobile ? 0.65 : 0.5,
        debug: false,
      })
      .onStepEnter(({ element }) => {
        const allSteps = document.querySelectorAll(`#${section.id} .step`);
        allSteps.forEach(s => s.classList.remove('is-active'));
        element.classList.add('is-active');
        section.updateChart(element.dataset.step);
      })
      .onStepExit(({ element, direction }) => {
        // Handle scroll-back
        if (direction === 'up') {
          const allSteps = Array.from(document.querySelectorAll(`#${section.id} .step`));
          const exitIndex = allSteps.indexOf(element);
          if (exitIndex > 0) {
            const prevStep = allSteps[exitIndex - 1];
            allSteps.forEach(s => s.classList.remove('is-active'));
            prevStep.classList.add('is-active');
            section.updateChart(prevStep.dataset.step);
          }
        }
      });
  });
}

// ── Resize handler ──────────────────────────
function handleResize() {
  createSalaryChart();
  createGapChart();
  createHousingChart();
  createSolutionChart();
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(handleResize, 250);
});

// ── Init ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollama();
});
