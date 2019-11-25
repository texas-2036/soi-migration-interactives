

const fs = require('fs');
const d3 = require('d3')
const outflow = fs.readFileSync(__dirname + '/../src/data/stateoutflow1516.csv').toString();
const outflowOld = fs.readFileSync(__dirname + '/../src/data/stateoutflow1415.csv').toString();


const parsed = d3.csvParse(outflow);
const parsedOld = d3.csvParse(outflowOld);


let filtered = parsed.filter((d) => +d.y1_statefips === 48 && d.y2_state !== 'TX' && d.y2_state !== 'FR');

const filteredOld = parsedOld.filter((d) => +d.y1_statefips === 48 && d.y2_state !== 'TX' && d.y2_state !== 'FR');

const oldMap = {};
filteredOld.forEach((d) => {
  oldMap[+d.y2_statefips] = d;
})


filtered.sort((a, b) => (+b.n2) - (+a.n2))

filtered = filtered.map(d => {
  return { ...d, lastYear: oldMap[+d.y2_statefips] }
});

console.log(filtered);

fs.writeFileSync(__dirname + '/../src/data/state-outflow-filtered.json', JSON.stringify(filtered));

// d3.csv(outflowFile, function(data, err) {
//   console.log(data);
// }, function(row) {
//   console.log(row)
// });



// const outflowFiltered = outflow.filter((d) => d.y1_statefips === 48);


// const outflowProcessed = {};


// outflowFiltered.forEach((d) => {
//   if (d.n1 < 0 || [48, 57].indexOf(d.y2_statefips) > -1 || d.y2_countyname.indexOf('Total Migration') > -1 || d.y2_countyname.indexOf('Other flows') > -1) {
//     return;
//   }

//   if (!outflowProcessed[d.y1_countyfips]) {
//     outflowProcessed[d.y1_countyfips] = {
//       states: {}
//     }
//   }

//   if (!outflowProcessed[d.y1_countyfips].states[d.y2_statefips]) {
//     outflowProcessed[d.y1_countyfips].states[d.y2_statefips] = {
//       total: 0,
//       counties: []
//     }
//   }

//   outflowProcessed[d.y1_countyfips].states[d.y2_statefips].total += d.n1;
// })



// Object.keys(outflowProcessed).forEach((k, i) => {
//   const county = outflowProcessed[k];
//   const statesSorted = []

//   Object.keys(county.states).forEach((stateFips) => {
//     const stateTotal = county.states[stateFips].total;
//     statesSorted.push({
//       code: stateFips,
//       total: stateTotal
//     })
//   });

//   statesSorted.sort((a, b) => b.total - a.total);

//   county.statesSorted = statesSorted;

//   console.log(`County ${k}, top state: ${statesSorted[0].code} (${statesSorted[0].total})`);
//   // if (i === 0) {
//   //   console.log(statesSorted);
//   // }

//   delete county.states
// })


// fs.writeFileSync(__dirname + '/../src/data/countyoutflow-processed.json', JSON.stringify(outflowProcessed));