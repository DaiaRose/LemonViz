import * as d3 from 'd3';
const app = d3.select('div#app');

// Starting data
const sourceCSV = 'TinnedFish.csv';

// Load the CSV
const data = await d3.csv(sourceCSV);

// Ensure numeric and other necessary conversions
data.forEach(d => {
    d.Index = +d.Index;
    d.Price = +d.Price;
    d.Rarity = +d.Rarity;
    d.Miles = +d.Miles.replace(",", "");
    d.Degrees = +d.Degrees;
    d.Smoked = +d.Smoked;
    d.Seared = +d.Seared;
    d.Citrus = +d.Citrus;
    d.Garlic = +d.Garlic;
    d.Chili = +d.Chili;
    d.Tomato = +d.Tomato;
});

// Data Chart 1:
const chart1Data = data.map(d => ({
  Index: d.Index,
  Name: d.Name,
  Country: d.Origin,
  Seared: d.Seared,
  Smoked: d.Smoked,
  Citrus: d.Citrus,
  Garlic: d.Garlic,
  Tomato: d.Tomato,
  Chili: d.Chili
}));
console.log("Chart 1 Data:",chart1Data);


const countryCounts = d3.rollup(
	chart1Data, 
	v => v.length, 
	d => d.Country
);
// Log the result
console.log("Unique Countries and Counts:", Array.from(countryCounts.entries()));

const countryColors = {
    France: "#CCCE9E",       // Grey-green
    Spain: "#929764",        // moss
    Morocco: "#E09F3E",      // Gold
    Italy: "#FFF3B0",        // Vanilla
    Germany: "#5B6652",      // Olive
    Portugal: "#cf5877",     // Flesh pink
    "Unknown": "#5D545A",          // Unknown
    Latvia: "#224b5b",       // Dark teal
    Japan: "#BF6535",        // Thai tea
    Chile: "#99A88C",        // Sage
    "Cape Verde": "#F0C977", // Sunshine
    China: "#E0AC73",        // Light tangerine
    Armenia: "#c78fa3",      // Pink
    USA: "#2F5C5B",          // just another blue green
    Denmark: "#7091ca",      // Blue sky
    Norway: "#5DA9E9",       // Light blue
    Poland: "#E63946",       // Rose red
    Peru: "#d0d083",         // Olive oil
    "Poland and Germany": "#75394D", // grey reddish
    "El Salvador": "#2A9D8F", // Turquoise
    Canada: "#65496E",        // purple
    Scotland: "#A8DADC",      // Seafoam
    Russia: "#8D99AE",        // Steel blue
    Taiwan: "#FFB703",        // Goldenrod
    Korea: "#118AB2",         // Deep teal
    Greece: "#457B9D"         // Mediterranean blue
};

function generateSineWavePath(startX, startY, width, amplitude, frequency, steps) {
    let path = `M${startX},${startY}`; // Start point of the path
    const stepSize = Math.abs(width) / steps; // Distance between points

    for (let i = 0; i <= steps; i++) {
        const x = startX + i * stepSize * Math.sign(width); // Adjust for negative width
        const y = startY + amplitude * Math.sin(i * frequency); // Sine wave calculation
        path += ` L${x},${y}`; // Append line to the next point
    }

    return path;
}

function generateVerticalSineWavePath(startX, startY, height, amplitude, frequency, steps) {
    let path = `M${startX},${startY}`; // Start point of the path
    const stepSize = Math.abs(height) / steps; // Distance between points

    for (let i = 0; i <= steps; i++) {
        const y = startY + i * stepSize * Math.sign(height); // Adjust for negative height
        const x = startX + amplitude * Math.sin(i * frequency); // Sine wave calculation
        path += ` L${x},${y}`; // Append line to the next point
    }
    return path;
}

function createFishPath(fishGroup, countryColor) {
    fishGroup.append('path')
        .attr('d', 'M205 12C205 12 205 23 186 28L58.5 48C58.5 48 -7.49999 23 1.50002 30.5C10.5 38 36.5 59.5 36.5 59.5C36.5 59.5 14.5 82 9.5 89C4.5 96 64.5 64.5 64.5 64.5L151 82L214 89L200 111L208.5 121.5H219L227 89L306.5 67.5V59.5C306.5 59.5 296.548 63.5637 296 59.5C295.575 56.3499 305 51.5 305 51.5L236 28L229.5 14.5L208.5 1L205 12Z') // Fish path
        .attr('fill', countryColor) // Apply dynamic fill color
        .attr('transform', 'translate(30, 35) scale(0.4)') // Position and size
        .attr('opacity', 0.6); // Set transparency
        }



// Starting chart 1
function chart(selection) {
    const svgWidth = 200;
    const svgHeight = 150;

    selection.each(function (chart1Data) {
        const svg = d3.select(this)
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

		// COUNTRY
        // Add a filter for the bevel effect
        const defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "bevel");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2)
            .attr("result", "blur");
	
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 1)
            .attr("dy", 1)
            .attr("result", "offsetBlur");

        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "offsetBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Add the rectangle with the country color
        svg.append("rect")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", 180)
            .attr("height", 100)
            .attr("fill", countryColors[chart1Data.Country] || "#cccccc") // Fallback for unassigned countries
            .attr("rx", 30) // Rounded corners
            .attr("filter", "url(#bevel)");

		// base NEUTRAL interior
        svg.append("rect")
            .attr("x", 20)
            .attr("y", 20)
            .attr("width", 160)
            .attr("height", 80)
            .attr("fill", "#fff9d9")
            .attr("rx", 20) // Rounded corners

        const fishGroup = svg.append("g").attr("class", "fish");
        
        //FISH
       // Function to add the fish path dynamically
        function loadFishPath(fishGroup, chart1Data) {
            const countryColor = countryColors[chart1Data.Country] || "#cccccc";
            if (fishGroup.select('path').empty()) {
                createFishPath(fishGroup, countryColor); // Append the fish path
            }
}

        // Intersection Observer callback
        function onIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    const fishGroup = d3.select(container).select('.fish');
                    const chart1Data = d3.select(container).datum();

                    // Load the fish path dynamically
                    loadFishPath(fishGroup, chart1Data);
                }
            });
        }

        // Create the Intersection Observer
        const observer = new IntersectionObserver(onIntersection, {
            root: document.querySelector('#small-multiples'), // Scrolling container
            rootMargin: '0px',
            threshold: 0.1, // Trigger when 10% of the element is visible
        });

        // Observe each .small-multiple
        d3.selectAll('.small-multiple').each(function () {
            observer.observe(this);
        });

        const graphicGroup = svg.append("g").attr("class", "graphics");
        
        // orange V=smoked
        if (chart1Data.Smoked === 1) {
            graphicGroup.append("rect")
                .attr("x", 25)
                .attr("y", 25)
                .attr("width", 150)
                .attr("height", 70)
                .attr("fill", "none") // No fill, just an outline
                .attr("stroke", "#e7c3fa") // lilac border
                .attr("stroke-width", 3)
                .attr("rx", 20); 
        }

        //SEARED
        if (chart1Data.Seared === 1) {
            const sear = "#704741"; // color for seared
            
            // Generate paths for each side of the rectangle
            //startX, startY, length, amplitude, frequency, steps
            const topWave = generateSineWavePath(161, 35, -120.3, 4, 0.68, 48); // Top wave
            const rightWave = generateVerticalSineWavePath(160, 34, 49.5, 4, 0.5, 30); // Right wave
            const bottomWave = generateSineWavePath(163, 83, -125, 4, 0.67, 50); // Bottom wave (reverse direction)
            const leftWave = generateVerticalSineWavePath(41, 38.5, 48.5, 4, -0.5, 30); // Left wave (flipped)
        
            // Append each wave as its own path
            graphicGroup.append("path")
                .attr("d", topWave)
                .attr("stroke", sear)
                .attr("stroke-width", 3)
                .attr("fill", "none");
        
            graphicGroup.append("path")
                .attr("d", rightWave)
                .attr("stroke", sear)
                .attr("stroke-width", 3)
                .attr("fill", "none");
        
            graphicGroup.append("path")
                .attr("d", bottomWave)
                .attr("stroke", sear)
                .attr("stroke-width", 3)
                .attr("fill", "none");
        
            graphicGroup.append("path")
                .attr("d", leftWave)
                .attr("stroke", sear)
                .attr("stroke-width", 3)
                .attr("fill", "none");
        }

        //CITRUS
        if (chart1Data.Citrus === 1) {
            const lemonGroup = graphicGroup.append("g")
                .attr("transform", "translate(125, 70)"); // Position of the lemon slice
        
            // Append the half-circle directly
            lemonGroup.append("path")
                .attr("d", d3.arc() // Create the half-circle
                    .innerRadius(0)
                    .outerRadius(15) // Radius of the lemon slice
                    .startAngle(0) // Start of the arc in radians
                    .endAngle(Math.PI) // End of the arc (half-circle)
                )
                .attr("fill", "#f0e418"); // Lemon slice color

            // Add the spokes
            const spokes = 5; // Number of spokes
            const spokeLength = 13; // Length of each spoke
        
            for (let i = 0; i < spokes; i++) {
                // Adjust angle for a narrower range within the right half-circle
                const angle = (-0.4 * Math.PI) + (i / (spokes - 1)) * (0.8 * Math.PI);
                const x2 = Math.cos(angle) * spokeLength; // Spoke endpoint X
                const y2 = Math.sin(angle) * spokeLength; // Spoke endpoint Y
        
                lemonGroup.append("line")
                    .attr("x1", 0) // Center of the slice
                    .attr("y1", 0)
                    .attr("x2", x2) // End of the spoke
                    .attr("y2", y2)
                    .attr("stroke", "#fffddb") // Spokes color
                    .attr("stroke-width", 1);
            }
        }
        
        //TOMATO
        if (chart1Data.Tomato === 1) {
            const tomatoGroup = graphicGroup.append("g")
                .attr("transform", "translate(100, 50)"); // Position of the tomato shape
        
            // Append the full circle (tomato slice)
            tomatoGroup.append("path")
                .attr("d", d3.arc() // Create the full circle
                    .innerRadius(3)
                    .outerRadius(15) // Radius of the circle
                    .startAngle(0) // Start angle: 0 radians
                    .endAngle(2 * Math.PI) // End angle: 2π radians (full circle)
                )
                .attr("fill", "#e0462f"); // Red color for the tomato circle
        
            // Add the spokes
            const spokes = 7; // Number of spokes
            const spokeLength = 13; // Length of each spoke
        
            for (let i = 0; i < spokes; i++) {
                // Distribute spokes evenly across the full circle
                const angle = (2 * Math.PI / spokes) * i; // Divide 2π into equal segments for spokes
                const x2 = Math.cos(angle) * spokeLength; // Spoke endpoint X
                const y2 = Math.sin(angle) * spokeLength; // Spoke endpoint Y
        
                tomatoGroup.append("line")
                    .attr("x1", 0) // Center of the circle
                    .attr("y1", 0)
                    .attr("x2", x2) // End of the spoke
                    .attr("y2", y2)
                    .attr("stroke", "#fff9d9") // neutral for spokes
                    .attr("stroke-width", 2);
            }
        }
        
        //CHILI
        if (chart1Data.Chili === 1) {
            const chiliGroup = graphicGroup.append("g");
        
            // Define the points for the scalene triangle
            const points = [
                [60, 45], // Top-right corner
                [45, 40], // top left
                [65, 70]  // Bottom-right
            ];
        
            // Append the triangle to the group
            chiliGroup.append("polygon")
                .attr("points", points.map(d => d.join(",")).join(" ")) // Convert points to string
                .attr("fill", "#ff4c33") // Red color for chili
                .attr("stroke", "none"); // No border for the triangle
        }
        
        //GARLIC
        if (chart1Data.Garlic === 1) {
            const garlicGroup = graphicGroup.append("g")
                .attr("transform", "translate(70, 60) scale(0.2)");
        
            const garlicPath = `
                M138 149.5C157.787 139.909 175.5 107.5 175.5 107.5V88C175.5 88 164.267 72.6745 155 65
                C128.484 43.0395 102.372 53.7367 69.5 43.5C49.1584 37.1655 33.6593 39.9461 18 25.5
                C9.44046 17.6036 1 1 1 1C1 1 6.67785 13.4124 10 21.5C23.3316 53.9549 13.7101 80.4036
                36 107.5C63.367 140.768 99.2354 168.289 138 149.5Z
            `;
        
            // Append the garlic outline
            garlicGroup.append("path")
                .attr("d", garlicPath) // Use the garlic path
                .attr("fill", "#f7dfd7"); //
        }
    });
}


d3.select('#app') // Target the #app div
    .append('div') // Create a container for the small multiples
    .attr('id', 'small-multiples') // Optional: add an ID for styling
    .selectAll('div') // Bind data to div elements
    .data(chart1Data)
    .enter()
    .append('div')
    .attr('class', 'small-multiple')
    .each(function (d) {
        d3.select(this)
            .append('h4')
            .text(d.Name); // Add a title for each chart

        d3.select(this)
            .call(chart); // Call the chart function
    });




