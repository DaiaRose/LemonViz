import * as d3 from 'd3';

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

console.log("Processed Starting Data:", data);


// Filter or group the main dataset for each chart

// Chart 1:
const chart1Data = data.map(d => ({
  Index: d.Index,
  Country: d.Origin,
  Seared: d.Seared,  // Already converted binary fields
  Smoked: d.Smoked,
  Citrus: d.Citrus,
  Garlic: d.Garlic,
  Tomato: d.Tomato,
  Chili: d.Chili
}));
console.log("Chart 1 Data:",chart1Data);


// Chart 2:
// Group by country and select the required fields
const chart2Data = Array.from(
  d3.rollup(
    data.filter(d => d.Origin !== "?" && d.Origin !== "Poland and Germany" ),
      v => {
          const firstEntry = v[0];
          return {
              country: firstEntry.Origin,
              distance: firstEntry.Miles,
              angle: firstEntry.Degrees
          }; //first entry because all entries for a country are the same
      },
      d => d.Origin // Group by country (Origin)
  ).values() // Get the grouped values
);

console.log("Chart 2 Data:", chart2Data);


// Chart 3: 
// Step 1: Calculate total number of fish with Rarity > 0
const totalFish = data.filter(d => d.Rarity > 0).length;
// console.log("Total Number of Fish with Rarity Scores:", totalFish);

// Step 2: Prepare chart3Data with rarity percentages and quantities
const chart3Data = Array.from(
  d3.rollup(
      data,
      v => ({
          quantity: v.length,          // Count the number of entries
          totalScore: d3.sum(v, d => d.Rarity), // Aggregate rarity scores
      }),
      d => d.Price, // Group by price
      d => d.Type  // Then group by fish type within each price group
  ),
  ([price, typeMap]) => ({
      price, // Price level
      types: Array.from(typeMap, ([type, values]) => ({
          fishType: type, // Fish type
          quantity: values.quantity, // Total quantity for this type at this price
          Rarity: (values.totalScore / totalFish).toFixed(2), // Total rarity score divided by totalFish
      }))
  })
);
console.log("Chart 3 Data:", chart3Data);


// Step 3: Determine fish types and sort by total rarity score across all prices
const sortedFishTypes = Array.from(
  d3.rollup(
      chart3Data.flatMap(d => d.types), // Flatten types across all price levels
      v => d3.sum(v, d => +d.Rarity),  // Sum Rarity values for each type
      d => d.fishType // Group by fish type
  ),
  ([fishType, totalRarity]) => ({ fishType, totalRarity }) // Map to an array
)
  .sort((a, b) => b.totalRarity - a.totalRarity) // Sort by total rarity descending
  .map(d => d.fishType); // Extract sorted fish types
// console.log("Sorted Fish Types by Total Rarity:", sortedFishTypes);


// Chart 4: 
const liquidMapping = {
  "Olive Oil": "Olive Oil",
  "Extra Virgin Olive Oil Organic": "Extra Virgin Olive Oil",
  "Olive Oil Organic": "Olive Oil",
  "Rapeseed": "Rapeseed Oil",
  "Rapeseed Oil": "Rapeseed Oil"
};

const normalizeLiquid = liquid =>
  liquid
    .split(",") // Split by comma
    .map(l => l.trim()) // Remove extra spaces
    .map(l => liquidMapping[l] || l) // Map to the unified category or keep as-is
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .sort(); // Sort alphabetically (returns array for multiple counting)

const chart4Data = Array.from(
  d3.rollup(
    data.filter(d => d.Origin !== "?"),
    v => {
      const liquidCounts = {};
      v.forEach(d => {
        const normalizedLiquids = normalizeLiquid(d.Liquid);
        normalizedLiquids.forEach(l => {
          liquidCounts[l] = (liquidCounts[l] || 0) + 1; // Increment count for each component
        });
      });
      return Object.entries(liquidCounts).map(([liquid, count]) => ({ liquid, count }));
    },
    d => d.Origin // Group by country
  ),
  ([country, liquids]) => ({
    country, // Country name
    liquids // Array of normalized liquid types and their counts
  })
);

console.log("Chart 4 Data:", chart4Data);
    

