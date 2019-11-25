import React from 'react';
import counties from '../data/texas-counties.json'
// import us from '../data/us-10m.v1.json'
import * as d3 from 'd3';
import * as topojson from 'topojson';

import { brandColors } from '../utils/colors'
import { formatNumber } from '../utils/text'
import SVG from './svg';

const mapWidth = 975;
const mapHeight = 610;


class CountyChoropleth extends React.Component {
  constructor(props) {
    super(props);
    const projection  = d3.geoAlbersUsa().scale(3400).translate([mapWidth / 1.6, - mapHeight / 7]);
    this.path = d3.geoPath().projection(projection);
    this.data = topojson.feature(counties, counties.objects.texasCounties).features;
    this.countiesD = this.path(topojson.mesh(counties, counties.objects.texasCounties, function(a, b) { return a !== b; }));

    this.dataPathCache = {};
  }

  getFill(fips) {
    if (+fips === +this.props.county) {
      return brandColors.yellow;
    }



    if(this.props.data["" + +fips]) {
      return this.scale(this.props.data["" + +fips].total);
    }

    return this.scale(20);
  }

  renderDataMap() {
    // if (this._dataMap) {
    //   return this._dataMap;
    // }

    this._dataMap = this.data.map((d, i) => {
      if (!this.dataPathCache[+d.properties.COUNTYFP]) {
        this.dataPathCache[+d.properties.COUNTYFP] = this.path(d)
      }
      const _d = this.dataPathCache[+d.properties.COUNTYFP];
      return <path className={'county-path'} data-name={d.properties.COUNTYFP} fill={this.getFill(d.properties.COUNTYFP)} key={i} d={_d} onMouseEnter={() => +this.props.county !== +d.properties.COUNTYFP && this.props.handleSelect(+d.properties.COUNTYFP) } />
    })

    return this._dataMap;
  }

  render() {
    // this.scale = d3.scaleLinear().domain([0, this.props.max]).range(['#fff', brandColors.teal]);
    this.scale = d3.scaleLinear().domain([20, Math.max(this.props.max, 21)]).range(['#f5f5f5', brandColors.teal]);
    return (
      <div  className="county-choropleth flex" onMouseLeave={() => this.props.handleSelect(null)}>
        <SVG width={'100%'} height={'auto'} style={{ maxHeight: '90vh', display: 'block', flex: 3, alignSelf: 'flex-start', cursor: 'pointer', overflow: 'visible' }} viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
          <g transform={`translate(0, ${mapHeight - 60})`}>
              <rect x={0} y={0} width={20} height={20} fill={brandColors.yellow} />
              <text x={30} dy={15}>{this.props.name}</text>
          </g>
          {
            this.props.max > 20 ?
            <g transform={`translate(0, ${mapHeight - 20})`}>
              <text dy={15}>{"< 20"}</text>
              {
                d3.range(100).map((i) => {
                  return <rect key={i} fill={this.scale(Math.max(this.props.max, 20) * i / 100)} x={40 + 2 * i} y={0} width={2} height={20}  />
                })
              }
              <text x={250} dy={15}>{formatNumber(Math.max(this.props.max, 20))}</text>

              {/* <rect x={0} y={40} width={20} height={20} fill={brandColors.lightGray} />
              <text x={30} y={40} dy={15}>No data available</text> */}
            </g> : null
          }
          <g >
            {this.renderDataMap()}
          </g>

          <path stroke={brandColors.darkGray} fill="none" d={this.countiesD} strokeWidth={0.5} />

          {
            this.props.selected ? (
              <path className={'county-path'} fill={'none'} stroke={'#000000'} strokeWidth={2} d={this.dataPathCache[+this.props.selected]}  />
            ) : null
          }
        </SVG>
      </div>
    )
  }
}


export default CountyChoropleth;
