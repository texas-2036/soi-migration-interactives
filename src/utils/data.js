
import outflowCounties from '../data/countyoutflow-processed.json';
import stateRegions from '../data/state-region.json';


const getCountyName = (fips) => {
  if (outflowCounties["" + +fips] && outflowCounties["" + +fips].name) {
    console.log('returning ', outflowCounties["" + +fips].name)
    return outflowCounties["" + +fips].name;
  }
  return 'No data';
}
const getStateName = (fips) => {
  if (stateRegions["" + +fips] && stateRegions["" + +fips].state_name) {
    console.log('undefined name', stateRegions["" + +fips].state_name);
    return stateRegions["" + +fips].state_name || 'No data';
  }
  return 'No data';
}


export { getCountyName, getStateName };

