import React from 'react';
import * as d3 from 'd3';
import { brandColors, getNumberColor } from '../utils/colors'
import { formatName, formatNumber } from '../utils/text'
import { getCountyName, getStateName } from "../utils/data";
import { isMobile } from "../utils/device";
import TriangleIndicator from './triangle-indicator'
import SVG from './svg';

class BarChart extends React.Component {
  constructor(props) {
    super(props);
  }

  formatName(fips) {
    if (!fips) {
      return '';
    }
    if (this.props.mode === 'county') {
      return getCountyName(fips);
    } else if (this.props.mode === 'state') {
      getStateName(fips)
    }
  }

  render() {

    const max = this.props.data.length ? this.props.data[0].total : 100;
    const scale = d3.scaleLinear().domain([0, max]).range([1, 350]);
    const colorScale = d3.scaleLinear().domain([20, Math.max(21, max)]).range(['#f5f5f5', brandColors.teal]);

    const limit = 8;

    let dataShow = this.props.data.slice(0, limit);
    if (this.props.selected && dataShow.every((d) => +d.code !== +this.props.selected)) {
      let elt = this.props.data.filter((d) => +d.code === +this.props.selected);
      if (!elt || !elt.length) {
        elt = { name: this.formatName(+this.props.selected), total: 0, code: +this.props.selected }
      } else {
        elt = elt[0]
      }

      if (isMobile()) {
        dataShow = [elt].concat(dataShow);
      } else {
        dataShow = dataShow.concat([elt]);
      }
    }
    return (
      <div style={{ paddingLeft: 15 }} onMouseLeave={() => this.props.handleSelect(null)}>
        {
          dataShow.map(({name, total, code, percentChange}) => {
            if (!name || name.toLowerCase() === 'no data') {
              // console.log('noname', name, total, code, percentChange)
              return <div key={code} className={`bar-chart-item ${+code === +this.props.selected ? 'selected': ''}`} onMouseEnter={() => this.props.handleSelect(code)}>
                No data
              </div>
            }
            // console.log(percentChange);
            return <div key={code} className={`bar-chart-item ${+code === +this.props.selected ? 'selected': ''}`} onMouseEnter={() => this.props.handleSelect(code)}>

              {/* <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}> */}
                <div>
                  {formatName(name)}
                    {
                      percentChange !== -1 && !isNaN(percentChange) && percentChange !== undefined ?
                      <span className="fade">
                        <span style={{color:getNumberColor(Math.round(+percentChange * 100)), fontSize:12, paddingLeft: '0.5em'}}>
                          {Math.round(+percentChange * 100)}%
                        </span>
                        {
                          Math.round(+percentChange * 100) !== 0 ? <TriangleIndicator width={12} height={8} direction={percentChange} /> : null
                        }
                      </span>
                        : null
                    }
                </div>
                {/* <div> */}
                <div style={{position: 'relative', left: -35, top: -16, height: 0, textAlign: 'right'}}>
                </div>
              {/* </div> */}
              <div>
                <SVG viewBox={`0 0 400 20`} style={{width: '100%', overflow: 'visible'}}>
                  <rect x={0} y={5} width={scale(total)} height={10} fill={colorScale(total)}  />
                  <text x={scale(total) + 5} y={15}   fontSize={12} >
                    {total === 0 ? '< 20' : formatNumber(total)}
                  </text>
                </SVG>
              </div>
            </div>
          })
        }
        {
          this.props.data.length ? null : <div>
            <i>
              No data available.
            </i>
          </div>
        }
      </div>
    )
  }
}


export default BarChart;
