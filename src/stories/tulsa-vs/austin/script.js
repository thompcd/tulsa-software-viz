import * as d3 from 'd3';
import scrollama from 'scrollama';
import data from './data.json';

// ============================================
// Tulsa vs Austin — Scrollytelling Visualizations
// ============================================

const COLORS = {
  tulsa: '#2d6a4f',
  austin: '#e07b39',
  adjusted: '#e07b39',
  text: '#1a1a1a',
  textLight: '#6b6b6b',
  border: '#e0ddd5',
  accent: '#c23616',
  bg: '#fafaf7',
};

const fmt = {
  dollar: d3.format('$,.0f'),
  dollarK: (v) => `$${d3.format(',.0f')(v / 1000)}K`,
  percent: d3.format('.1f'),
  comma: d3.format(','),
};

// ── Utility ──────────────────────────
function getChartDimensions(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return { width: 600, height: 400, margin: { top: 60, right: 30, bottom: 40, left: 50 } };
  const rect = container.getBoundingClientRect();
  const width = Math.min(rect.width, 700);
  const height = Math.min(rect.height || 400, 500);
  return {
    width,
    height,
    margin: { top: 60, right: 30, bottom: 50, left: 60 },
  };
}

// ── Chart 1: Salary Comparison ──────────────────────────
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
    .text('Tech Salaries: Nominal vs Real');

  svg.append('text')
    .attr('class', 'chart-subtitle')
    .attr('x', margin.left)
    .attr('y', 42)
    .text('Mean annual salary, BLS May 2024');

  // Data
  const salaryData = {
    tulsaNominal: data.sections.salaryIllusion.data.tulsaComputerMathMeanSalary.value,
    austinNominal: data.sections.salaryIllusion.data.austinSoftwareDeveloperSalary.value,
    austinAdjusted: data.sections.salaryIllusion.data.austinSalaryAdjustedToTulsa.value,
  };

  const categories = ['Tulsa', 'Austin (Nominal)', 'Austin (COL-Adjusted)'];
  const values = [salaryData.tulsaNominal, salaryData.austinNominal, salaryData.austinAdjusted];
  const colors = [COLORS.tulsa, COLORS.austin, COLORS.adjusted];
  const opacities = [1, 1, 0.4];

  const y = d3.scaleBand()
    .domain(categories)
    .range([0, innerH])
    .padding(0.35);

  const x = d3.scaleLinear()
    .domain([0, 160000])
    .range([0, innerW]);

  // Grid lines
  const ticks = x.ticks(5);
  g.selectAll('.grid-line')
    .data(ticks)
    .join('line')
    .attr('class', 'grid-line')
    .attr('x1', d => x(d))
    .attr('x2', d => x(d))
    .attr('y1', 0)
    .attr('y2', innerH);

  // Axis labels
  g.selectAll('.axis-label')
    .data(ticks)
    .join('text')
    .attr('class', 'axis-label')
    .attr('x', d => x(d))
    .attr('y', innerH + 20)
    .attr('text-anchor', 'middle')
    .text(d => fmt.dollarK(d));

  // Bars
  const bars = g.selectAll('.bar')
    .data(categories)
    .join('rect')
    .attr('class', (d, i) => i === 2 ? 'bar bar-adjusted' : (i === 0 ? 'bar bar-tulsa' : 'bar bar-austin'))
    .attr('y', d => y(d))
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('width', 0)
    .attr('rx', 3)
    .attr('opacity', (d, i) => opacities[i]);

  // Labels
  g.selectAll('.bar-label')
    .data(categories)
    .join('text')
    .attr('class', 'bar-label')
    .attr('x', 0)
    .attr('y', d => y(d) - 6)
    .text(d => d);

  // Value labels
  const valueLabels = g.selectAll('.bar-value')
    .data(categories)
    .join('text')
    .attr('class', (d, i) => `bar-value ${i === 0 ? 'tulsa' : (i === 2 ? 'adjusted' : 'austin')}`)
    .attr('y', d => y(d) + y.bandwidth() / 2 + 5)
    .attr('x', 5)
    .attr('opacity', 0);

  // Store references for animation
  window._salaryChart = { bars, valueLabels, values, x, y, categories, g, innerW, innerH, svg, salaryData };
}

function updateSalaryChart(step) {
  const chart = window._salaryChart;
  if (!chart) return;
  const { bars, valueLabels, values, x, salaryData } = chart;

  if (step === 'salary-1') {
    // Show nominal bars for both cities
    bars.transition().duration(800).ease(d3.easeCubicOut)
      .attr('width', (d, i) => i <= 1 ? x(values[i]) : 0);
    valueLabels.transition().duration(800)
      .attr('x', (d, i) => i <= 1 ? x(values[i]) + 8 : 5)
      .attr('opacity', (d, i) => i <= 1 ? 1 : 0)
      .text((d, i) => i <= 1 ? fmt.dollar(values[i]) : '');
  } else if (step === 'salary-2') {
    // Keep both, maybe highlight gap
    bars.transition().duration(800).ease(d3.easeCubicOut)
      .attr('width', (d, i) => i <= 1 ? x(values[i]) : 0);
    valueLabels.transition().duration(800)
      .attr('x', (d, i) => i <= 1 ? x(values[i]) + 8 : 5)
      .attr('opacity', (d, i) => i <= 1 ? 1 : 0)
      .text((d, i) => i <= 1 ? fmt.dollar(values[i]) : '');

    // Add gap annotation
    const gapGroup = chart.g.selectAll('.gap-annotation').data([1]);
    const gapEnter = gapGroup.enter().append('g').attr('class', 'gap-annotation');
    gapEnter.append('line').attr('class', 'annotation-line');
    gapEnter.append('text').attr('class', 'annotation');

    const gapMerge = gapGroup.merge(gapEnter);
    gapMerge.select('line')
      .transition().duration(600)
      .attr('x1', x(salaryData.tulsaNominal))
      .attr('x2', x(salaryData.austinNominal))
      .attr('y1', chart.y('Tulsa') + chart.y.bandwidth() + 15)
      .attr('y2', chart.y('Tulsa') + chart.y.bandwidth() + 15)
      .attr('opacity', 1);
    gapMerge.select('text')
      .transition().duration(600)
      .attr('x', x((salaryData.tulsaNominal + salaryData.austinNominal) / 2))
      .attr('y', chart.y('Tulsa') + chart.y.bandwidth() + 32)
      .attr('text-anchor', 'middle')
      .attr('opacity', 1)
      .text(`↔ $${d3.format(',.0f')(salaryData.austinNominal - salaryData.tulsaNominal)} gap`);

  } else if (step === 'salary-3') {
    // Show all three bars including adjusted
    bars.transition().duration(800).ease(d3.easeCubicOut)
      .attr('width', (d, i) => x(values[i]));
    valueLabels.transition().duration(800)
      .attr('x', (d, i) => x(values[i]) + 8)
      .attr('opacity', 1)
      .text((d, i) => fmt.dollar(values[i]));

    // Remove gap annotation
    chart.g.selectAll('.gap-annotation').transition().duration(300).attr('opacity', 0).remove();

    // Add "winner" annotation
    const winGroup = chart.g.selectAll('.win-annotation').data([1]);
    const winEnter = winGroup.enter().append('g').attr('class', 'win-annotation');
    winEnter.append('text').attr('class', 'annotation');

    winGroup.merge(winEnter).select('text')
      .transition().duration(800).delay(400)
      .attr('x', x(salaryData.tulsaNominal) + 8)
      .attr('y', chart.y('Tulsa') - 20)
      .attr('opacity', 1)
      .text('← Tulsa wins on purchasing power');
  }
}

// ── Chart 2: Housing Comparison ──────────────────────────
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
    .text('Home Prices & Rent');

  svg.append('text')
    .attr('class', 'chart-subtitle')
    .attr('x', margin.left)
    .attr('y', 42)
    .text('Typical home price and 2BR monthly rent');

  window._housingChart = { svg, g, innerW, innerH, margin, width, height };
}

function updateHousingChart(step) {
  const chart = window._housingChart;
  if (!chart) return;
  const { g, innerW, innerH } = chart;

  const housing = data.sections.housingComparison.data;

  if (step === 'housing-1') {
    g.selectAll('*').remove();

    // Home price comparison - big number blocks
    const homeData = [
      { city: 'Tulsa', value: housing.tulsaMedianHome.value, color: COLORS.tulsa },
      { city: 'Austin', value: housing.austinMedianHome.value, color: COLORS.austin },
    ];

    const x = d3.scaleBand().domain(['Tulsa', 'Austin']).range([0, innerW]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 650000]).range([innerH, 0]);

    // Grid
    y.ticks(5).forEach(tick => {
      g.append('line').attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick));
      g.append('text').attr('class', 'axis-label')
        .attr('x', -8).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .text(fmt.dollarK(tick));
    });

    g.selectAll('.home-bar')
      .data(homeData)
      .join('rect')
      .attr('class', d => `home-bar bar-${d.city.toLowerCase()}`)
      .attr('x', d => x(d.city))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerH - y(d.value));

    g.selectAll('.home-label')
      .data(homeData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', innerH + 25)
      .attr('text-anchor', 'middle')
      .text(d => d.city);

    g.selectAll('.home-value')
      .data(homeData)
      .join('text')
      .attr('class', d => `bar-value ${d.city.toLowerCase()}`)
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition().duration(800).delay(400)
      .attr('opacity', 1)
      .text(d => fmt.dollar(d.value));

    // 3.2x annotation
    g.append('text')
      .attr('class', 'annotation')
      .attr('x', innerW / 2)
      .attr('y', y(600000) + 15)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition().duration(600).delay(800)
      .attr('opacity', 1)
      .text('3.2× more expensive');

  } else if (step === 'housing-2') {
    g.selectAll('*').remove();

    // Rent comparison
    const rentData = [
      { city: 'Tulsa', value: housing.tulsa2BRRent.value, color: COLORS.tulsa },
      { city: 'Austin', value: housing.austin2BRRent.value, color: COLORS.austin },
    ];

    const x = d3.scaleBand().domain(['Tulsa', 'Austin']).range([0, innerW]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 2200]).range([innerH, 0]);

    y.ticks(5).forEach(tick => {
      g.append('line').attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick));
      g.append('text').attr('class', 'axis-label')
        .attr('x', -8).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .text(`$${d3.format(',')(tick)}`);
    });

    g.selectAll('.rent-bar')
      .data(rentData)
      .join('rect')
      .attr('x', d => x(d.city))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerH - y(d.value));

    g.selectAll('.rent-label')
      .data(rentData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', innerH + 25)
      .attr('text-anchor', 'middle')
      .text(d => d.city);

    g.selectAll('.rent-value')
      .data(rentData)
      .join('text')
      .attr('class', d => `bar-value ${d.city.toLowerCase()}`)
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition().duration(800).delay(400)
      .attr('opacity', 1)
      .text(d => `$${d3.format(',')(d.value)}/mo`);

    // Savings annotation
    const savings = housing.austin2BRRent.value - housing.tulsa2BRRent.value;
    g.append('text')
      .attr('class', 'annotation')
      .attr('x', innerW / 2)
      .attr('y', y(2100))
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition().duration(600).delay(800)
      .attr('opacity', 1)
      .text(`$${d3.format(',')(savings * 12)}/year in savings`);

    // Chart title update
    chart.svg.select('.chart-title').text('Monthly Rent: 2-Bedroom');
    chart.svg.select('.chart-subtitle').text('BestPlaces.net, 2026');

  } else if (step === 'housing-3') {
    g.selectAll('*').remove();

    // Homeownership rate
    const ownerData = [
      { city: 'Tulsa', value: data.sections.tulsaGrowth.data.tulsaHomeownership.value, color: COLORS.tulsa },
      { city: 'Austin', value: data.sections.tulsaGrowth.data.austinHomeownership.value, color: COLORS.austin },
    ];

    const x = d3.scaleBand().domain(['Tulsa', 'Austin']).range([0, innerW]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 70]).range([innerH, 0]);

    y.ticks(5).forEach(tick => {
      g.append('line').attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick));
      g.append('text').attr('class', 'axis-label')
        .attr('x', -8).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .text(`${tick}%`);
    });

    g.selectAll('.owner-bar')
      .data(ownerData)
      .join('rect')
      .attr('x', d => x(d.city))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerH - y(d.value));

    g.selectAll('.owner-label')
      .data(ownerData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', innerH + 25)
      .attr('text-anchor', 'middle')
      .text(d => d.city);

    g.selectAll('.owner-value')
      .data(ownerData)
      .join('text')
      .attr('class', d => `bar-value ${d.city.toLowerCase()}`)
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition().duration(800).delay(400)
      .attr('opacity', 1)
      .text(d => `${d.value}%`);

    chart.svg.select('.chart-title').text('Homeownership Rate');
    chart.svg.select('.chart-subtitle').text('U.S. Census Bureau ACS, 2023');
  }
}

// ── Chart 3: Growth / Industry ──────────────────────────
function createGrowthChart() {
  const containerId = 'chart-growth';
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
    .text('Building an Economy');

  svg.append('text')
    .attr('class', 'chart-subtitle')
    .attr('x', margin.left)
    .attr('y', 42)
    .text('Key economic indicators');

  window._growthChart = { svg, g, innerW, innerH, margin, width, height };
}

function updateGrowthChart(step) {
  const chart = window._growthChart;
  if (!chart) return;
  const { g, innerW, innerH } = chart;
  const growth = data.sections.tulsaGrowth.data;

  if (step === 'growth-1') {
    g.selectAll('*').remove();

    // Population comparison with context
    const popData = [
      { city: 'Tulsa', value: growth.tulsaPopulation.value, color: COLORS.tulsa },
      { city: 'Austin', value: growth.austinPopulation.value, color: COLORS.austin },
    ];

    const x = d3.scaleBand().domain(['Tulsa', 'Austin']).range([0, innerW]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 1100000]).range([innerH, 0]);

    y.ticks(5).forEach(tick => {
      g.append('line').attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick));
      g.append('text').attr('class', 'axis-label')
        .attr('x', -8).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .text(tick >= 1000000 ? `${(tick/1000000).toFixed(1)}M` : `${(tick/1000).toFixed(0)}K`);
    });

    g.selectAll('.pop-bar')
      .data(popData)
      .join('rect')
      .attr('x', d => x(d.city))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerH - y(d.value));

    g.selectAll('.pop-label')
      .data(popData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', innerH + 25)
      .attr('text-anchor', 'middle')
      .text(d => d.city);

    g.selectAll('.pop-value')
      .data(popData)
      .join('text')
      .attr('class', d => `bar-value ${d.city.toLowerCase()}`)
      .attr('x', d => x(d.city) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition().duration(800).delay(400)
      .attr('opacity', 1)
      .text(d => fmt.comma(d.value));

    chart.svg.select('.chart-title').text('Population');
    chart.svg.select('.chart-subtitle').text('U.S. Census Bureau ACS, 2023');

  } else if (step === 'growth-2') {
    g.selectAll('*').remove();

    // Manufacturing employment share
    const mfgData = [
      { label: 'Tulsa', value: growth.tulsaManufacturingShare.value, color: COLORS.tulsa },
      { label: 'National Avg', value: 5.7, color: COLORS.textLight },
    ];

    const x = d3.scaleBand().domain(mfgData.map(d => d.label)).range([0, innerW]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 12]).range([innerH, 0]);

    y.ticks(6).forEach(tick => {
      g.append('line').attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick));
      g.append('text').attr('class', 'axis-label')
        .attr('x', -8).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .text(`${tick}%`);
    });

    g.selectAll('.mfg-bar')
      .data(mfgData)
      .join('rect')
      .attr('x', d => x(d.label))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerH - y(d.value));

    g.selectAll('.mfg-label')
      .data(mfgData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', innerH + 25)
      .attr('text-anchor', 'middle')
      .text(d => d.label);

    g.selectAll('.mfg-value')
      .data(mfgData)
      .join('text')
      .attr('class', 'bar-value tulsa')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.color)
      .attr('opacity', 0)
      .transition().duration(800).delay(400)
      .attr('opacity', 1)
      .text(d => `${d.value}%`);

    chart.svg.select('.chart-title').text('Manufacturing Share of Employment');
    chart.svg.select('.chart-subtitle').text('BLS OEWS May 2024 (national avg = 5.7%)');

  } else if (step === 'growth-3') {
    g.selectAll('*').remove();

    // Unemployment comparison
    const uempData = [
      { label: 'Tulsa', value: growth.tulsaUnemployment.value, color: COLORS.tulsa },
      { label: 'Austin', value: growth.austinUnemployment.value, color: COLORS.austin },
      { label: 'U.S. Avg', value: 6.0, color: COLORS.textLight },
    ];

    const x = d3.scaleBand().domain(uempData.map(d => d.label)).range([0, innerW]).padding(0.25);
    const y = d3.scaleLinear().domain([0, 8]).range([innerH, 0]);

    y.ticks(4).forEach(tick => {
      g.append('line').attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick));
      g.append('text').attr('class', 'axis-label')
        .attr('x', -8).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .text(`${tick}%`);
    });

    g.selectAll('.uemp-bar')
      .data(uempData)
      .join('rect')
      .attr('x', d => x(d.label))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerH - y(d.value));

    g.selectAll('.uemp-label')
      .data(uempData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', innerH + 25)
      .attr('text-anchor', 'middle')
      .text(d => d.label);

    g.selectAll('.uemp-value')
      .data(uempData)
      .join('text')
      .attr('class', 'bar-value')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.color)
      .attr('opacity', 0)
      .transition().duration(800).delay(400)
      .attr('opacity', 1)
      .text(d => `${d.value}%`);

    chart.svg.select('.chart-title').text('Unemployment Rate');
    chart.svg.select('.chart-subtitle').text('BestPlaces.net, 2026 (lower is better)');

  } else if (step === 'growth-4') {
    g.selectAll('*').remove();

    // Commute time
    const commuteData = [
      { label: 'Tulsa', value: growth.tulsaCommuteTime.value, color: COLORS.tulsa },
      { label: 'Austin', value: growth.austinCommuteTime.value, color: COLORS.austin },
    ];

    const x = d3.scaleBand().domain(commuteData.map(d => d.label)).range([0, innerW]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 35]).range([innerH, 0]);

    y.ticks(5).forEach(tick => {
      g.append('line').attr('class', 'grid-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(tick)).attr('y2', y(tick));
      g.append('text').attr('class', 'axis-label')
        .attr('x', -8).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .text(`${tick} min`);
    });

    g.selectAll('.comm-bar')
      .data(commuteData)
      .join('rect')
      .attr('x', d => x(d.label))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerH - y(d.value));

    g.selectAll('.comm-label')
      .data(commuteData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', innerH + 25)
      .attr('text-anchor', 'middle')
      .text(d => d.label);

    g.selectAll('.comm-value')
      .data(commuteData)
      .join('text')
      .attr('class', d => `bar-value ${d.label.toLowerCase()}`)
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition().duration(800).delay(400)
      .attr('opacity', 1)
      .text(d => `${d.value} min`);

    // Time saved annotation
    const diff = growth.austinCommuteTime.value - growth.tulsaCommuteTime.value;
    const hoursPerYear = Math.round(diff * 2 * 260 / 60); // round trip, ~260 working days
    g.append('text')
      .attr('class', 'annotation')
      .attr('x', innerW / 2)
      .attr('y', y(32))
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition().duration(600).delay(800)
      .attr('opacity', 1)
      .text(`${hoursPerYear} hours/year saved in Tulsa`);

    chart.svg.select('.chart-title').text('Average Commute Time');
    chart.svg.select('.chart-subtitle').text('U.S. Census Bureau ACS, 2023');
  }
}

// ── Chart 4: Punchline Scorecard ──────────────────────────
function createPunchlineChart() {
  const containerId = 'chart-punchline';
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const { width, height, margin } = getChartDimensions(containerId);

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  window._punchlineChart = { svg, width, height, margin };
}

function updatePunchlineChart(step) {
  const chart = window._punchlineChart;
  if (!chart) return;
  const { svg, width, height, margin } = chart;

  const comparison = data.sections.punchline.data.summaryComparison;

  if (step === 'punchline-1' || step === 'punchline-2' || step === 'punchline-3') {
    svg.selectAll('g.scorecard').remove();

    const g = svg.append('g')
      .attr('class', 'scorecard')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const innerW = width - margin.left - margin.right;
    const rowHeight = 38;
    const headerHeight = 30;

    // Header
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', 0)
      .attr('y', -20)
      .text('The Scorecard');

    // Column headers
    const colMetric = 0;
    const colTulsa = innerW * 0.42;
    const colAustin = innerW * 0.64;
    const colWinner = innerW * 0.86;

    ['Metric', 'Tulsa', 'Austin', ''].forEach((label, i) => {
      g.append('text')
        .attr('class', 'axis-label')
        .attr('x', [colMetric, colTulsa, colAustin, colWinner][i])
        .attr('y', headerHeight - 5)
        .attr('font-weight', '700')
        .text(label);
    });

    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', headerHeight + 2).attr('y2', headerHeight + 2)
      .attr('stroke', COLORS.border).attr('stroke-width', 1);

    // Rows
    const rows = comparison.length;
    const visibleRows = step === 'punchline-1' ? comparison : comparison;

    visibleRows.forEach((row, i) => {
      const yPos = headerHeight + 10 + (i * rowHeight);

      // Separator
      if (i > 0) {
        g.append('line')
          .attr('x1', 0).attr('x2', innerW)
          .attr('y1', yPos - 6).attr('y2', yPos - 6)
          .attr('stroke', COLORS.border).attr('stroke-width', 0.5);
      }

      // Metric name
      g.append('text')
        .attr('class', 'scorecard-metric')
        .attr('x', colMetric)
        .attr('y', yPos + 16)
        .attr('font-size', '11px')
        .attr('font-family', 'var(--font-sans)')
        .attr('fill', COLORS.text)
        .text(row.metric);

      // Tulsa value
      g.append('text')
        .attr('class', 'scorecard-value')
        .attr('x', colTulsa)
        .attr('y', yPos + 16)
        .attr('font-size', '12px')
        .attr('font-family', 'var(--font-sans)')
        .attr('font-weight', '600')
        .attr('fill', row.winner === 'tulsa' ? COLORS.tulsa : COLORS.text)
        .text(row.tulsa);

      // Austin value
      g.append('text')
        .attr('class', 'scorecard-value')
        .attr('x', colAustin)
        .attr('y', yPos + 16)
        .attr('font-size', '12px')
        .attr('font-family', 'var(--font-sans)')
        .attr('font-weight', '600')
        .attr('fill', row.winner === 'austin' ? COLORS.austin : COLORS.text)
        .text(row.austin);

      // Winner badge
      const badgeColor = row.winner === 'tulsa' ? COLORS.tulsa : COLORS.austin;
      const badgeX = colWinner;

      g.append('rect')
        .attr('x', badgeX)
        .attr('y', yPos + 3)
        .attr('width', 45)
        .attr('height', 18)
        .attr('rx', 9)
        .attr('fill', badgeColor)
        .attr('opacity', 0)
        .transition().duration(400).delay(i * 80)
        .attr('opacity', 1);

      g.append('text')
        .attr('class', 'winner-badge')
        .attr('x', badgeX + 22.5)
        .attr('y', yPos + 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-family', 'var(--font-sans)')
        .attr('fill', 'white')
        .attr('font-weight', '700')
        .attr('opacity', 0)
        .transition().duration(400).delay(i * 80)
        .attr('opacity', 1)
        .text(row.winner === 'tulsa' ? 'TULSA' : 'AUSTIN');
    });

    // Tally at bottom
    if (step === 'punchline-2' || step === 'punchline-3') {
      const tulsaWins = comparison.filter(r => r.winner === 'tulsa').length;
      const austinWins = comparison.filter(r => r.winner === 'austin').length;
      const tallyY = headerHeight + 10 + (rows * rowHeight) + 20;

      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', tallyY - 10).attr('y2', tallyY - 10)
        .attr('stroke', COLORS.text).attr('stroke-width', 1.5);

      g.append('text')
        .attr('x', colMetric)
        .attr('y', tallyY + 14)
        .attr('font-family', 'var(--font-sans)')
        .attr('font-size', '13px')
        .attr('font-weight', '800')
        .attr('fill', COLORS.tulsa)
        .attr('opacity', 0)
        .transition().duration(600).delay(700)
        .attr('opacity', 1)
        .text(`Tulsa ${tulsaWins} — Austin ${austinWins}`);
    }
  }
}

// ── Populate Sources ──────────────────────────
function populateSources() {
  const list = document.getElementById('sources-list');
  if (!list) return;
  data.sources.forEach(src => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${src.url}" target="_blank" rel="noopener">${src.name}</a> · Accessed ${src.accessed}`;
    list.appendChild(li);
  });
}

// ── Initialize Scrollama ──────────────────────────
function initScrollama() {
  const sections = [
    { id: 'scrolly-salary', createChart: createSalaryChart, updateChart: updateSalaryChart },
    { id: 'scrolly-housing', createChart: createHousingChart, updateChart: updateHousingChart },
    { id: 'scrolly-growth', createChart: createGrowthChart, updateChart: updateGrowthChart },
    { id: 'scrolly-punchline', createChart: createPunchlineChart, updateChart: updatePunchlineChart },
  ];

  const isMobile = window.innerWidth <= 900;

  sections.forEach(section => {
    section.createChart();

    const scroller = scrollama();
    scroller
      .setup({
        step: `#${section.id} .step`,
        // On mobile, trigger when step reaches the bottom of the sticky chart area
        offset: isMobile ? 0.7 : 0.5,
        debug: false,
      })
      .onStepEnter(({ element }) => {
        // Activate step
        const allSteps = document.querySelectorAll(`#${section.id} .step`);
        allSteps.forEach(s => s.classList.remove('is-active'));
        element.classList.add('is-active');

        const stepId = element.dataset.step;
        section.updateChart(stepId);
      });
  });
}

// ── Resize handler ──────────────────────────
function handleResize() {
  // Recreate charts on resize
  createSalaryChart();
  createHousingChart();
  createGrowthChart();
  createPunchlineChart();
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(handleResize, 250);
});

// ── Init ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateSources();
  initScrollama();
});
