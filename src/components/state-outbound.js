import React from 'react';
// import counties from '../data/texas-counties.json'
import us from '../data/us-10m.v1.json'
import * as d3 from 'd3';
import * as topojson from 'topojson';

import { brandColors, uiColors, getNumberColor } from '../utils/colors';
import { formatNumberShort, formatNumber } from '../utils/text';

import swoopyArrow from '../lib/swoopy-arrow';
import stateOutflow from '../data/state-outflow-filtered.json';

import SVG from './svg';
import TriangleIndicator from './triangle-indicator';


const outflowCache = {};
let minIn = Number.POSITIVE_INFINITY;
let maxIn = Number.NEGATIVE_INFINITY;

const dataAccessor = 'n1';

stateOutflow.forEach(d => {
  outflowCache[+d.y2_statefips] = d;
  if (+d[dataAccessor] < minIn) {
    minIn = d[dataAccessor];
  }
  if (+d[dataAccessor] > maxIn) {
    maxIn = d[dataAccessor];
  }
});

const colorScale = d3.scaleLinear().domain([20, maxIn]).range(['#f5f5f5', brandColors.teal]);


const COLORS = {
  blue: '#3A4AA2',
  lightBlue: '#6975B8',
  gray: '#6B6D6F',
  darkGray: '#333'
};

class StateOutbound extends React.Component {

  constructor(props) {
    super(props);
    this._refs = {};
    this.state = {
      rendered: false
    }

    this.pathCache = {}
  }

  getStateCenter(id) {
    const { x, y, width, height } = this._refs[+id].getBBox();
    return { x: x + width / 2, y: y + height / 2 };
  }

  drawTopPaths() {

    const states = stateOutflow.slice(0, 5).map(({y2_statefips, n1, y2_state_name }) => {
      return { fips: y2_statefips, weight: n1,  name: y2_state_name };
    })
    return (
      <g>
        {states.map(({ fips, name } )=> {
          return <g key={name}>
            <path  fill={'none'} stroke={'#000000'} strokeWidth={2} d={this.pathCache[+fips]}  />
          </g>
        })}
      </g>
    );
  }

  drawArrows() {

    // const states = [{ fips: '05', weight: 0.5 }];

    const states = stateOutflow.slice(0, 5).map(({y2_statefips, n1, n2, y2_state_name, lastYear }) => {
      return { fips: y2_statefips, weight: n1,  name: y2_state_name, lastYear: lastYear };
    })

    const start = this.getStateCenter(48);

    return (
      <g>
        <circle cx={start.x} cy={start.y} r={10} fill={COLORS.darkGray} />
        {states.map(({ fips, weight, name, lastYear } )=> {

          const end = this.getStateCenter(fips);


          // start.x = start.x + 0.05 * (end.x - start.x);
          // start.y = start.y + 0.05 * (end.y - start.y)


          const swoopBetweenElements = swoopyArrow()
            .angle(Math.PI / 4)
            .clockwise(end.x > start.x)
            .x(d => d.x )
            .y(d => d.y )

          const d = swoopBetweenElements([ start, end ]);
          return <g key={name}>
            <path key={fips} d={d} fill='none' stroke={COLORS.darkGray} strokeWidth={this.lineWidthScale(weight)} markerEnd={`url('#outboundarrowhead')`} />
            <rect width={170} height={65} x={end.x + 30} y={end.y - 50} fill="white" stroke="#000" strokeWidth={0.5}/>
            <line x1={end.x + 30} x2={end.x + 30} y1={end.y - 50} y2={end.y + 15}  stroke="#000" strokeWidth={3} />
            <text x={end.x + 30 + 5} y={end.y - 50 + 20}>
              {name}
            </text>
            <text x={end.x + 30 + 5} y={end.y - 50 + 38} className="number-text">
              {formatNumberShort(weight)} households
            </text>

            <g transform={`translate(${end.x + 30 + 5}, ${end.y - 50 + 48})`}>
              <TriangleIndicator width={18} height={10} direction={weight - lastYear.n1} />
              <text dx={20} dy={10} fill={getNumberColor(Math.round(100 * (weight - lastYear.n1) / (lastYear.n1)))}>
                {/* {weight - lastYear.n1 > 0 ? '+' : ''} */}
                {Math.round(100 * (weight - lastYear.n1) / (lastYear.n1))}%
              </text>
            </g>
          </g>
        })}
      </g>
    );
  }


  drawSelectedArrow() {
    const start = this.getStateCenter(48);

    const end = this.getStateCenter(this.props.selected);

    const swoopBetweenElements = swoopyArrow()
      .angle(Math.PI / 4)
      .clockwise(end.x > start.x)
      .x(d => d.x )
      .y(d => d.y )

    const d = swoopBetweenElements([ start, end ]);

    const data = (outflowCache[this.props.selected] || {n1: 0} )[dataAccessor];
    const name = outflowCache[this.props.selected].y2_state_name;
    const lastYear = (outflowCache[this.props.selected] || {lastYear: {n1: 0}} ).lastYear

    return (
      <g>
        <path d={d} fill='none' stroke={COLORS.darkGray} strokeWidth={this.lineWidthScale(data)} markerEnd={`url('#outboundarrowhead')`} />


        <rect width={170} height={65} x={end.x + 30} y={end.y - 50} fill="white" stroke="#000" strokeWidth={0.5}/>
        <line x1={end.x + 30} x2={end.x + 30} y1={end.y - 50} y2={end.y + 15}  stroke="#000" strokeWidth={3} />
        <text x={end.x + 30 + 5} y={end.y - 50 + 20}>
          {name}
        </text>
        <text x={end.x + 30 + 5} y={end.y - 50 + 38} className="number-text">
          {formatNumberShort(data)} households
        </text>
        <g transform={`translate(${end.x + 30 + 5}, ${end.y - 50 + 48})`}>
          <TriangleIndicator width={18} height={10} direction={data - lastYear.n1} />
          <text dx={20} dy={10} fill={getNumberColor(Math.round(100 * (data - lastYear.n1) / (lastYear.n1)))}>
            {/* {weight - lastYear.n1 > 0 ? '+' : ''} */}
            {Math.round(100 * (data - lastYear.n1) / (lastYear.n1))}%
          </text>
        </g>
      </g>
    );
  }

  handleInitialRender(_ref) {
    if (_ref && !this.state.rendered) {
      this.setState({
        rendered: true
      })
    }
  }

  getFill(id) {
    if (id === 48) {
      return brandColors.yellow;
    }

    return colorScale(outflowCache[id][dataAccessor]);
  }

  getStateLabel() {


    if (!this.props.selected) {

      const states = stateOutflow.slice(0, 5).map(({y2_statefips, n1, n2, y2_state_name}) => {
        return { name: y2_state_name, fips: y2_statefips, weight: n1 };
      })

      return  (
        <div style={{display: 'flex', flexDirection: 'row', margin: '0 auto', width: '100%', justifyContent:'space-around'}}>
          {states.map((d, i) => {
              return <div key={i}>
                <div>{d.name}</div>
                <div style={{color: brandColors.lightGray}}>{d.weight}</div>
              </div>
          })
          }
        </div>
      )
    }


    return <span>{outflowCache[this.props.selected].y2_state_name}<br/><span style={{color: brandColors.lightGray}}>{outflowCache[this.props.selected].n1} households</span></span>
    // (
    //   this.props.selected
    // )

  }

  render() {

    this.lineWidthScale = d3.scaleSqrt().domain([1, 24257]).range([3, 20])


    // Make sure at least one dimension is smaller than raster image (705 x 670).
    const mapWidth = 975;
    const mapHeight = 610;

    // Create a unit projection

    // const projection  = d3.geoAlbersUsa().scale(3000).translate([mapWidth / 1.6, - mapHeight / 7]);
    const path = d3.geoPath();//.projection(projection);

    const data = topojson.feature(us, us.objects.states).features;

    return (
      <div style={{width: '100%'}}>
        <h1>Where are Texans moving?</h1>
        {/* <h2 className="state-label">
          {this.getStateLabel()}
        </h2> */}
        <SVG style={{ width: '100%', height: 'auto', maxHeight: '70vh', display:'block', margin: '0 auto', cursor: 'pointer', overflow: 'visible' }} viewBox={`0 0 ${mapWidth} ${mapHeight}`} onMouseLeave={() => this.props.handleUpdateSelected(undefined)}>
          <defs>
            <marker id="outboundarrowhead" fill={COLORS.darkGray} viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth={20} markerHeight={20} strokeWidth="1" orient="auto"><polyline strokeLinejoin="bevel" points="-.75,-1.75 1,0 -.75,1.75"></polyline></marker>
          </defs>
          <g>
            {
              data.map((d, i) => {
                // console.log(path(d))
                // console.log(d);
                if (!this.pathCache[+d.id]) {
                  this.pathCache[+d.id] = path(d)
                }
                const _d = this.pathCache[+d.id];

                return <path key={d.id} ref={_ref => this._refs[+d.id] = _ref } id={d.id} fill={this.getFill(+d.id)} d={_d} onMouseEnter={() => this.props.handleUpdateSelected(+d.id === 48 ? null : +d.id)} />
                // return <path fill={getFill(d.properties.COUNTYFP)} key={i} d={path(d)} />
              })
            }
          </g>

          <path ref={(_ref => this.handleInitialRender(_ref))} stroke={brandColors.darkGray} strokeWidth={0.5} fill="none" d={path(topojson.mesh(us, us.objects.states, (a, b) => a !== b ))} />
          {
            this.state.rendered && !this.props.selected ?
              this.drawTopPaths()
            : null
          }{
            this.state.rendered && !this.props.selected ?
              this.drawArrows()
            : null
          }
          {
            this.state.rendered && this.props.selected ?
              <g>
                <path  fill={'none'} stroke={'#000000'} strokeWidth={2} d={this.pathCache[this.props.selected]}  />
                {this.drawSelectedArrow()}
              </g>
            : null
          }
          <g transform={`translate(0, ${mapHeight - 20})`}>
          <text dy={15}>{"< 20"}</text>
          {
            d3.range(100).map((i) => {
              return <rect key={i} fill={colorScale(Math.max(maxIn, 20) * i / 100)} x={40 + 2 * i} y={0} width={2} height={20}  />
            })
          }
          <text x={250} dy={15}>{formatNumber(maxIn)}</text>

          {/* <rect x={0} y={40} width={20} height={20} fill={brandColors.lightGray} />
          <text x={30} y={40} dy={15}>No data available</text> */}
        </g>

        </SVG>
      </div>
    )
  }
}


export default StateOutbound;
