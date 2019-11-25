
const fs = require('fs');

const currentInflow = require('../src/data/countyinflow-processed');
const currentOutflow = require('../src/data/countyoutflow-processed');
const prevInflow = require('../src/data/countyinflow-processed-prev');
const prevOutflow = require('../src/data/countyoutflow-processed-prev');

Object.keys(currentInflow).forEach(countyId => {
  Object.keys(currentInflow[countyId].states).forEach(state => {
    currentInflow[countyId].states[state].lastYear = prevInflow[countyId].states[state]
  })
  Object.keys(currentInflow[countyId].counties).forEach(county => {
    currentInflow[countyId].counties[county].lastYear = prevInflow[countyId].counties[county]
  })
  currentInflow[countyId].totals.lastYear = prevInflow[countyId].totals;
})
Object.keys(currentOutflow).forEach(countyId => {
  Object.keys(currentOutflow[countyId].states).forEach(state => {
    currentOutflow[countyId].states[state].lastYear = prevOutflow[countyId].states[state]
  })
  Object.keys(currentOutflow[countyId].counties).forEach(county => {
    if (prevOutflow[countyId].counties[county]) {
      currentOutflow[countyId].counties[county].lastYear = prevOutflow[countyId].counties[county]
    }
  })

  currentOutflow[countyId].totals.lastYear = prevOutflow[countyId].totals;
})

fs.writeFileSync(__dirname + '/../src/data/countyoutflow-processed.json', JSON.stringify(currentOutflow));
fs.writeFileSync(__dirname + '/../src/data/countyinflow-processed.json', JSON.stringify(currentInflow));
