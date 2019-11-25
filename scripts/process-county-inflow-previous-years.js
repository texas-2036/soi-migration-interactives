
const fs = require('fs');
const d3 = require('d3');
const stateRegion = require('../src/data/state-region.json');

const inflowRaw = fs.readFileSync(__dirname + '/../src/data/countyinflow1415.csv').toString();
const inflow = d3.csvParse(inflowRaw);

const inflowFiltered = inflow.filter((d) => +d.y2_statefips === 48).map(({y1_statefips, y1_countyfips, y2_statefips, y2_countyfips, y1_state, y1_countyname, n1, n2, agi}) => {
  return {
    y1_statefips: +y1_statefips,
    y1_countyfips: +y1_countyfips,
    y2_statefips: +y2_statefips,
    y2_countyfips: +y2_countyfips,
    y1_state: y1_state,
    y1_countyname: y1_countyname,
    n1: +n1,
    n2: +n2,
    agi: +agi
  }
})

const inflowProcessed = {};

const regionMap = {
  3: 'Midwest',
  1: 'Northeast',
  5: 'South',
  7: 'West'
};

inflowFiltered.forEach((d) => {
  if (d.n1 < 0 || [57].indexOf(d.y1_statefips) > -1 || d.y2_countyfips === 0) {
    return;
  }

  if (!inflowProcessed[d.y2_countyfips]) {
    inflowProcessed[d.y2_countyfips] = {
      states: {},
      // name: d.y2_countyname,
      regions: {},
      counties: {},
      totals: {}
    }
  }


  // console.log('adding total', d.y1_countyname);
  /**
   * Totals
   */
  if (d.y1_countyname.indexOf('Total Migration') > -1) {
    let key = '';
    if (d.y1_statefips === 96) {
      key = 'US and Foreign';

    } else if (d.y1_statefips === 97) {
      if (d.y1_countyfips === 0) {
        key = 'US'
      } else if (d.y1_countyfips === 1) {
        key = 'Same State';
      } else if (d.y1_countyfips === 3) {
        key = 'Different State'
      }
    } else if (d.y1_statefips === 98) {
        key = 'Foreign'
    }


    const countyName = d.y1_countyname.substr(0, d.y1_countyname.indexOf('Total Migration')).trim();
    inflowProcessed[d.y2_countyfips].name = countyName;
    inflowProcessed[d.y2_countyfips].totals[key] = d.n1;
    return;
  }


  /**
   * General Regional Flows
   */
  if (d.y1_countyname.indexOf('Other flows') > -1)  {
    // console.log('other flows')
    if (regionMap[d.y1_countyfips]) {
      const region = regionMap[d.y1_countyfips];
      inflowProcessed[d.y2_countyfips].regions[region] = {
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
  if (d.y1_statefips === 48) {
    // console.log('in texas');
    if (d.y1_countyfips === d.y2_countyfips) {
      return;
    }
    // console.log('\t', d);
    inflowProcessed[d.y2_countyfips].counties[d.y1_countyfips] = {
      name: d.y1_countyname,
      total: d.n1
    }
    return;
  }

  /**
  * Other State flows
  */
  if (!inflowProcessed[d.y2_countyfips].states[d.y1_statefips]) {
    // console.log(+d.y1_statefips, stateRegion[+d.y1_statefips])
    inflowProcessed[d.y2_countyfips].states[d.y1_statefips] = {
      name: stateRegion[+d.y1_statefips].state_name,
      total: 0,
      counties: []
    }
  }

  inflowProcessed[d.y2_countyfips].states[d.y1_statefips].total += d.n1;

  inflowProcessed[d.y2_countyfips].states[d.y1_statefips].counties.push({
    name: d.y1_countyname,
    total: d.n1
  })

})

// console.log(inflowProcessed);

Object.keys(inflowProcessed).forEach((k, i) => {
  const county = inflowProcessed[k];
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


// console.log(inflowProcessed[421]);

fs.writeFileSync(__dirname + '/../src/data/countyinflow-processed-prev.json', JSON.stringify(inflowProcessed));