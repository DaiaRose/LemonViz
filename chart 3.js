
import * as d3 from 'd3';
const app = d3.select('div#app');

// create an svg
const svg1 = app
	.append('div')
	.style('padding', '10px')
	.append('svg')
	.attr('width', 500)
	.attr('height', 500);

const TRANSITION_SPEED = 300;

const drawChart1 = (data) => {
	console.log(`drawing chart...`, data);
	const enter = (enter) => {
		const g = enter.append('g');
		g.append('rect');
		g.append('text');
		g.attr('transform', (d, i) => `translate(0, ${i * 50})`);
		g.attr('opacity', 0);

		g.transition().duration(TRANSITION_SPEED).attr('opacity', 1);
		return g;
	};

	const update = (update) => {
		d3.interrupt(update);
		return update
			.transition()
			.duration(TRANSITION_SPEED)
			.attr('opacity', 1)
			.attr('transform', (d, i) => `translate(0, ${i * 50})`);
	};

	const exit = (exit) => {
		d3.interrupt(update);
		return exit
			.transition()
			.duration(TRANSITION_SPEED)
			.attr('transform', (d, i) => `translate(200, ${i * 50})`)
			.style('opacity', 0)
			.remove();
	};

	svg
		.attr('viewBox', [0, 0, 500, dataset.length * 50])
		.attr('height', dataset.length * 50)
		.selectAll('g')
		.data(data, (d) => d.name)
		.join(enter, update, exit)
		.on('click', (event, d) => {
			// remove self from data array
			drawChart(dataset);
			console.log({ dataset });
		})
		.style('cursor', 'pointer')
		.call((g) => {
			g.select('rect')
				.attr('x', 2)
				.attr('y', 2)
				.attr('width', 46)
				.attr('height', 46)
				.attr('fill', (d) => colorScale(d.value));
			g.select('text')
				.attr('x', 60)
				.attr('y', 25)
				.attr('dominant-baseline', 'central')
				.text((d) => `${d.name} (${d.value})`);
		});
};

drawChart1(dataset);





//Chart 3

///Actual Chart///

// Define chart dimensions and margins
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG container
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Process and sort stack data for chart
const stackData = chart3Data
  .map(d => ({
    price: d.price,
    ...Object.fromEntries(
      sortedFishTypes.map(t => [t, d.types.find(type => type.fishType === t)?.quantity || 0])
    )
  }));

console.log("Processed stackData for Quantity:", stackData);

const xScale = d3
  .scaleBand()
  .domain(stackData.map(d => d.price))
  .range([0, width])
  .padding(0.2);

const yScale = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(stackData, d => d3.sum(sortedFishTypes, t => d[t] || 0)) // Sum of quantities
  ])
  .nice()
  .range([height, 0]);

const colorScale = d3.scaleOrdinal().domain(sortedFishTypes).range(d3.schemeTableau10);

const stackGenerator = d3.stack().keys(sortedFishTypes);
const series = stackGenerator(stackData);

// Add X-axis
svg
  .append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(xScale).tickFormat(d => `$${d}`));

// Add Y-axis
svg.append("g").call(d3.axisLeft(yScale));


// Define the tooltip
const tooltip = d3.select("#tooltip");

// Bars with hover interaction
svg
  .selectAll("g.series")
  .data(series)
  .join("g")
  .attr("class", "series")
  .attr("fill", d => colorScale(d.key))
  .selectAll("rect")
  .data(d => d.map(e => ({ ...e, type: d.key }))) // Include type in the rect data
  .join("rect")
  .attr("x", d => xScale(d.data.price))
  .attr("y", d => yScale(d[1]))
  .attr("height", d => yScale(d[0]) - yScale(d[1]))
  .attr("width", xScale.bandwidth())
  .on("mouseover", function (event, d) {
    tooltip
      .style("opacity", 1)
      .html(`Price: $${d.data.price}<br>Type: ${d.type}<br>Quantity: ${d[1] - d[0]}`)
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY + 10}px`);
  })
  .on("mousemove", function (event) {
    tooltip
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY + 10}px`);
  })
  .on("mouseout", function () {
    tooltip.style("opacity", 0);
  });