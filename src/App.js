import React from 'react';
import CountyCardOutbound from './components/county-card-outbound';
import CountyCardInbound from './components/county-card-inbound';
import StateOutbound from './components/state-outbound';
import StateInbound from './components/state-inbound';

import outflowCounties from './data/countyoutflow-processed.json';
import inflowCounties from './data/countyinflow-processed.json';

import { brandColors } from './utils/colors';
import logo from './tx-logo-square.png'

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      counties: 'outbound',
      states: 'outbound',
      county: 201,
      state: null
    }
  }

  getLabel(county) {
    switch(county) {
      case 'inbound':
        return 'into'
      case 'outbound':
        return 'out of'
    }
  }

  handleToggleCounties() {
    let updated = this.state.counties === 'inbound' ? 'outbound' : 'inbound';
    this.setState({
      counties: updated
    });
  }
  handleToggleState() {
    let updated = this.state.states === 'inbound' ? 'outbound' : 'inbound';
    this.setState({
      states: updated
    });
  }

  handleCountyChange(e) {
    // console.log('new county', e.target.value);
    this.setState({
      county: +e.target.value
    })
  }

  handleUpdateSelectedState(state) {
    this.setState({ state: state })
  }

  render() {

    const { county } = this.state;

    console.log('this.state.counties', this.state.counties);
    const countyDataMap = this.state.counties === 'inbound' ? inflowCounties : outflowCounties;
    const countyData = countyDataMap[county];

    return (
      <div className="App" style={{margin: '1em 0'}}>
        <h1 style={{textAlign: 'center'}}>
          Migration <span className={'action'} style={{background: this.state.states === 'inbound' ? brandColors.yellow : brandColors.teal, color: this.state.states === 'inbound' ? 'black' : 'white'}} onClick={this.handleToggleState.bind(this)}>{this.getLabel(this.state.states)}</span> Texas
        </h1>
        <h2 className="subhead">
          Source: 2015-16 IRS SOI migration statistics. Percent change shown as compared to 2014-15 values.
        </h2>
        <div className="interactive-card flex" style={{textAlign: 'center', width: '100%'}}>
            {
              this.state.states === 'inbound' ? <StateInbound selected={this.state.state} handleUpdateSelected={this.handleUpdateSelectedState.bind(this)} /> : <StateOutbound selected={this.state.state} handleUpdateSelected={this.handleUpdateSelectedState.bind(this)} />
            }
            <img className="logo-watermark" src={logo} />
        </div>
        <div style={{marginTop: '8em', marginBottom: '8em'}}>
          <h1 style={{textAlign: 'center'}}>
            Migration <span className={'action'} style={{background: this.state.counties === 'inbound' ? brandColors.yellow : brandColors.teal, color: this.state.counties === 'inbound' ? 'black' : 'white'}}  onClick={this.handleToggleCounties.bind(this)}>{this.getLabel(this.state.counties)}</span>
            <select value={county} onChange={this.handleCountyChange.bind(this)}>
              {Object.keys(outflowCounties).filter(key => outflowCounties[key].name).map((key) => {
                return (
                  <option key={key} value={key}>{outflowCounties[key].name}</option>
                )
              })}
            </select>
          </h1>
          <h2 className="subhead">
            Source: 2015-16 IRS SOI migration statistics. Percent change shown as compared to 2014-15 values.
          </h2>
          {/* <CountyOutbound county={county} data={countyData} /> */}
          <div className="interactive-card">
            {this.state.counties === 'inbound' ? <CountyCardInbound county={county} data={countyData} /> : <CountyCardOutbound county={county} data={countyData} />}
            <img className="logo-watermark" src={logo} />
          </div>
        </div>
      </div>
    );
  }

}

export default App;
