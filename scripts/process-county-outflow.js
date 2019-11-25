


const fs = require('fs');

const d3 = require('d3');
const stateRegion = require('../src/data/state-region.json');

const outflowRaw = fs.readFileSync(__dirname + '/../src/data/countyoutflow1516.csv').toString();

const outflow = d3.csvParse(outflowRaw);

const outflowFiltered = outflow.filter((d) => +d.y1_statefips === 48).map(({y1_statefips, y1_countyfips, y2_statefips, y2_countyfips, y2_state, y2_countyname, n1, n2, agi}) => {
  return {
    y1_statefips: +y1_statefips,
    y1_countyfips: +y1_countyfips,
    y2_statefips: +y2_statefips,
    y2_countyfips: +y2_countyfips,
    y2_state: y2_state,
    y2_countyname: y2_countyname,
    n1: +n1,
    n2: +n2,
    agi: +agi
  }
});



// console.log(outflowFiltered);

fs.writeFileSync(__dirname + '/../src/data/countyoutflow-filtered.json', JSON.stringify(outflowFiltered));


const outflowProcessed = {};

const regionMap = {
  3: 'Midwest',
  1: 'Northeast',
  5: 'South',
  7: 'West'
};

outflowFiltered.forEach((d) => {
  if (d.n1 < 0 || [57].indexOf(d.y2_statefips) > -1 || d.y1_countyfips === 0) {
    return;
  }

  if (!outflowProcessed[d.y1_countyfips]) {
    outflowProcessed[d.y1_countyfips] = {
      states: {},
      // name: d.y2_countyname,
      regions: {},
      counties: {},
      totals: {}
    }
  }


  /**
   * Totals
   */
  if (d.y2_countyname.indexOf('Total Migration') > -1) {
    let key = '';
    console.log(d);
    if (d.y2_statefips === 96) {
      key = 'US and Foreign';

    } else if (d.y2_statefips === 97) {
      if (d.y2_countyfips === 0) {
        key = 'US'
      } else if (d.y2_countyfips === 1) {
        key = 'Same State';
      } else if (d.y2_countyfips === 3) {
        key = 'Different State'
      }
    } else if (d.y2_statefips === 98) {
        key = 'Foreign'
    }

    const countyName = d.y2_countyname.substr(0, d.y2_countyname.indexOf('Total Migration')).trim();
    outflowProcessed[d.y1_countyfips].name = countyName;
    outflowProcessed[d.y1_countyfips].totals[key] = d.n1;
    return;
  }


  /**
   * General Regional Flows
   */
  if (d.y2_countyname.indexOf('Other flows') > -1)  {
    // console.log('other flows')
    if (regionMap[d.y2_countyfips]) {
      const region = regionMap[d.y2_countyfips];
      outflowProcessed[d.y1_countyfips].regions[region] = {
        total: d.n1,
        name: region
      }
    } else {
      // state or foreign flow
    }
    return;
  }

  /**
   * Flows within texas
   */
  if (d.y2_statefips === 48) {
    // console.log('in texas');
    if (d.y2_countyfips === d.y1_countyfips) {
      return;
    }
    // console.log('\t', d);
    outflowProcessed[d.y1_countyfips].counties[d.y2_countyfips] = {
      name: d.y2_countyname,
      total: d.n1
    }
    return;
  }

  /**
  * Other State flows
  */
  if (!outflowProcessed[d.y1_countyfips].states[d.y2_statefips]) {
    // console.log(+d.y2_statefips, stateRegion[+d.y2_statefips])
    outflowProcessed[d.y1_countyfips].states[d.y2_statefips] = {
      name: stateRegion[+d.y2_statefips].state_name,
      total: 0,
      counties: []
    }
  }

  outflowProcessed[d.y1_countyfips].states[d.y2_statefips].total += d.n1;

  outflowProcessed[d.y1_countyfips].states[d.y2_statefips].counties.push({
    name: d.y2_countyname,
    total: d.n1
  })

})



Object.keys(outflowProcessed).forEach((k, i) => {
  const county = outflowProcessed[k];
  const statesSorted = [];
  const regionsSorted = [];

  Object.keys(county.states).forEach((stateFips) => {
    const stateTotal = county.states[stateFips].total;
    const counties = county.states[stateFips].counties;
    counties.sort((a, b) => b.total - a.total);
    statesSorted.push({
      code: +stateFips,
      total: +stateTotal,
      name: county.states[stateFips].name,
      counties: county.states[stateFips].counties
    })
  });

  statesSorted.sort((a, b) => b.total - a.total);
  county.statesSorted = statesSorted;


  Object.keys(county.regions).forEach((region) => {
    const regionTotal = county.regions[region].total;
    regionsSorted.push({
      total: +regionTotal,
      name: region
    })
  });

  // statesSorted.sort((a, b) => b.total - a.total);
  // county.statesSorted = statesSorted;


  regionsSorted.sort((a, b) => b.total - a.total);
  county.regionsSorted = regionsSorted;

  /**
   * TODO - add  county sorted
   */


  if (statesSorted.length) {
    // console.log(`County ${k}, top state: ${+statesSorted[0].code} (${statesSorted[0].total})`);
  }
  // if (i === 0) {
  //   console.log(statesSorted);
  // }

  // delete county.states
  delete county.regions
})


console.log(outflowProcessed[421]);

fs.writeFileSync(__dirname + '/../src/data/countyoutflow-processed.json', JSON.stringify(outflowProcessed));