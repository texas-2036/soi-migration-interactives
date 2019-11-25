import React from 'react';
import Sankey from './sankey';
import CountyChoropleth from './county-choropleth';
import StateChoropleth from './state-choropleth';
import BarChart from './bar-chart';

const getPercentChange = (d) => {
  if (d.lastYear) {
    return (d.total - d.lastYear.total) / d.lastYear.total;
  }
  return -1;
}

class CountyCardOutbound extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      county: null,
      state: null
    }
  }

  handleCountySelect(county) {
    this.setState({
      county: county
    })
  }
  handleStateSelect(state) {
    this.setState({
      state: state
    })
  }


  renderCounties() {

  }

  render() {
    const { county, data } = this.props;
    const { county : selectedCounty, state : selectedState } = this.state;

    const counties = Object.keys(data.counties).map((key) => {
      return { ...data.counties[key], code: key, percentChange: getPercentChange(data.counties[key]) }
    })
    const states = Object.keys(data.states).map((key) => {
      return { ...data.states[key], code: key, percentChange: getPercentChange(data.states[key]) }
    })

    let maxCounties = -1;
    if (counties.length) {
      counties.sort((a, b) => b.total - a.total);
      maxCounties = counties[0].total;
    }

    let maxStates = -1;
    if (states.length) {
      states.sort((a, b) => b.total - a.total);
      maxStates = states[0].total;
    }

    // const maxCounties = d3.max(data.counties, d => d.total);

    return (
      <div className="county-data-card">
        <h1>Where are people moving?</h1>
        <Sankey key={data.name} data={data.totals} name={data.name} />
        {
          // maxCounties > -1
          true
           ?
          <div>
            <h1>Which counties did they move to?</h1>
            <div  className="flex">
              <div style={{flex: 2}}>
                <CountyChoropleth name={data.name} county={county} data={data.counties} max={maxCounties} selected={selectedCounty} handleSelect={this.handleCountySelect.bind(this)}  />
              </div>
              <div style={{flex: 1}}>
                <BarChart  mode="county" data={counties} selected={selectedCounty} handleSelect={this.handleCountySelect.bind(this)} />
              </div>
            </div>
          </div> : null
        }
        {
          // maxStates > -1
          true
          ?
          <div>
            <h1>Which states did they move to?</h1>
            <div  className="flex">
              <div style={{flex: 2}}>
                <StateChoropleth data={data.states} max={maxStates} selectedState={selectedState} handleSelect={this.handleStateSelect.bind(this)} />
              </div>
              <div style={{flex: 1}}>
                <BarChart mode="state" data={states} selected={selectedState} handleSelect={this.handleStateSelect.bind(this)} />
              </div>
            </div>
          </div> : null
        }
      </div>
    );
  }
}


export default CountyCardOutbound;
