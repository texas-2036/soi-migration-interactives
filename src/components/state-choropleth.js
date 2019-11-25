import React from 'react';
import us from '../data/us-10m.v1.json'
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { brandColors } from '../utils/colors'
import { formatNumber } from '../utils/text'
import SVG from './svg';

const mapWidth = 975;
const mapHeight = 610;

class StateChoropleth extends React.Component {

  constructor(props) {
    super(props);
    this._refs = {};
    this.state = {
      rendered: false
    }

    this.path = d3.geoPath();//.projection(projection);
    this.data = topojson.feature(us, us.objects.states).features;

    this.statesD = this.path(topojson.mesh(us, us.objects.states, (a, b) => a !== b ));
    this.dataPathCache = {}
  }

  getFill(fips) {
    if (+fips === +48) {
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
      const id = +d.id;
      if (!this.dataPathCache[id]) {
        this.dataPathCache[id] = this.path(d)
      }
      const _d = this.dataPathCache[id];
      return <path className={'state-path'} fill={this.getFill(id)} key={i} d={_d} onMouseEnter={() => id != 48 && this.props.handleSelect(id)}/>
    })

    return this._dataMap;
  }

  render() {
    this.scale = d3.scaleLinear().domain([20, Math.max(this.props.max, 21)]).range(['#f5f5f5', brandColors.teal]);
    return (
      <SVG width={'100%'} height={'auto'} style={{ maxHeight: '90vh', cursor: 'pointer' }} viewBox={`0 0 ${mapWidth} ${mapHeight}`} onMouseLeave={() => this.props.handleSelect(null)}>
        <defs>
          <marker id="arrowhead" fill={brandColors.darkGray} viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth={20} markerHeight={20} strokeWidth="1" orient="auto"><polyline strokeLinejoin="bevel" points="-6.75,-6.75 0,0 -6.75,6.75"></polyline></marker>
        </defs>
        <g>
          {
            this.renderDataMap()
          }
        </g>
        <path stroke={brandColors.darkGray} strokeWidth={0.5} fill="none" d={this.statesD} />

        {
          this.props.max > 20 ?
            <g transform={`translate(0, ${mapHeight - 20})`}>
              <text dy={15}>{"< 20"}</text>
              {
                d3.range(100).map((i) => {
                  return <rect key={i} fill={this.scale(Math.max(this.props.max, 21) * i / 100)} x={40 + 2 * i} y={0} width={2} height={20}  />
                })
              }
              <text x={250} dy={15}>{formatNumber(Math.max(this.props.max, 21))}</text>

              {/* <rect x={0} y={40} width={20} height={20} fill={brandColors.lightGray} />
              <text x={30} y={40} dy={15}>No data available</text> */}
            </g> : null
        }
        {
            this.props.selectedState ? (
              <path  fill={'none'} stroke={'#000000'} strokeWidth={2} d={this.dataPathCache[this.props.selectedState]}  />
            ) : null
          }

      </SVG>
    )
  }
}


export default StateChoropleth;
