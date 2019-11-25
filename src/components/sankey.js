import React from 'react';
import Path from 'svg-path-generator';
import * as d3 from 'd3';
import { brandColors, getNumberColor } from '../utils/colors';
import { formatNumber } from '../utils/text';
import SVG from './svg';

const colors = [ brandColors.yellow, brandColors.teal, brandColors.darkGray ];

const svgWidth = 1140;
const labelBuffer = 100;
const svgHeight = Math.max(svgWidth / 4 + 2 * labelBuffer, 600);
const arrowHeight = 40;

class Sankey extends React.Component {

  drawCategoryPath(cx1, cy1, cx2, cy2, width, height, turnOffset) {

    const arrowEdgeHang = Math.max(15, width * 0.25);
    const localarrowHeight = Math.min(arrowEdgeHang + width, arrowHeight);

    const bottomAdjust = (arrowHeight - localarrowHeight);

    const top = cy1 + height / 2 + labelBuffer;
    const bottom = cy2 - height / 2 + bottomAdjust + labelBuffer;
    const leftTop = cx1 - width / 2;
    const rightTop = cx1 + width / 2;
    const leftBottom = cx2 - width / 2;
    const rightBottom = cx2 + width / 2;

    const goingLeft = leftTop > leftBottom;

    return Path()
      .moveTo(leftTop, top)
      // .curveTo(leftTop, goingLeft ? top + 3 * (bottom - top) / 4 : bottom, leftBottom, goingLeft ? top : top + (bottom - top) / 4, leftBottom, bottom)
      .curveTo(leftTop, goingLeft ? bottom - width : bottom + turnOffset, leftBottom, goingLeft ? top : top + width + turnOffset, leftBottom, bottom)
      .horizontalLineTo(leftBottom - arrowEdgeHang)
      .lineTo(cx2, bottom + localarrowHeight)
      .lineTo(rightBottom + arrowEdgeHang, bottom)
      .horizontalLineTo(rightBottom)
      // .smoothCurveTo(cx1 + width / 2, (cy1 + height / 2 + cy2 - height / 2) / 2, cx1 + width / 2, cy1 + height / 2)
      .curveTo(rightBottom, goingLeft ? top + width : top + turnOffset, rightTop, goingLeft ? bottom : bottom - width + turnOffset, rightTop, top)
      .close()
      .end();
  }

  getBottomX(idx, hasNational, hasForeign) {
    switch('' + idx)  {
      case '0':
        if (!hasForeign && !hasNational) {
          return svgWidth / 2;
        }
        if (!hasForeign) {
          return svgWidth / 4
        }
        return svgWidth / 4
      case '1':
        if (!hasForeign) {
          return 2 * svgWidth / 3
        }
        return 2 * svgWidth / 3 - 10;
      case '2':
        return 10 * svgWidth / 12;
    }
  }


  /**
   * TODO - render sankey
   */
  render() {

    const { data } = this.props;

    const categories = [ { key: 'Same State', label: 'Within Texas' }, { key: 'Different State', label: 'Another State'}, { key: 'Foreign', label: 'Another Country'} ];
    const total = data['US and Foreign'];
    const totalLastYear = data.lastYear['US and Foreign']

    const scaleFactor = 8;
    const scale = d3.scaleLinear().domain([0, total]).range([0, svgWidth / scaleFactor]);


    const hasForeign = data['Foreign'] && data['Foreign'] > 0;
    const hasNational = data['Different State'] &&  data['Different State'] > 0;
    const fontScale = d3.scaleSqrt().domain([hasForeign ? data['Foreign'] : data['Different State'], total]).range([18, 24, 28, 36, 42, 56]);
    const lineHeightScale = d3.scaleSqrt().domain([hasForeign ? data['Foreign'] : data['Different State'] || total, total]).range([22, 28, 36, 42, 48, 64]);

    const dataPoints = categories.reduce((memo, { key }, idx) => {
      const width = scale(data[key]);

      if (this.props.isReverse) {
        memo.dataPoints[key] = {
          cx1: this.getBottomX(idx, hasNational, hasForeign),
          cx2: memo.positionTop + width / 2 + [-20, 20, 40][idx],
          cy1: 0,
          cy2: svgHeight - 2 * labelBuffer - arrowHeight,
          width: width
        }
      } else {
        memo.dataPoints[key] = {
          cx1: memo.positionTop + width / 2,
          cx2: this.getBottomX(idx, hasNational, hasForeign),
          cy1: 0,
          cy2: svgHeight - 2 * labelBuffer - arrowHeight,
          width: width
        }
      }
      memo.positionTop += width;
      memo.positionBottom += width + (svgWidth - (svgWidth / scaleFactor)) / 4;
      return memo;
    }, { positionTop: svgWidth / 2 - svgWidth / scaleFactor / 2, positionBottom: (svgWidth - (svgWidth / scaleFactor)) / 4, dataPoints: {} }).dataPoints;
    return (
      <div className="sankey">
        <SVG style={{width: '100%', display: 'block', margin: '0 auto', overflow: 'visible'}} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* <circle cx={svgWidth / 2} cy={labelBuffer / 2} fill={'none'} stroke={'black'} strokeWidth={3}r={labelBuffer / 2} /> */}
          <text x={svgWidth / 2} y={this.props.isReverse ? svgHeight - labelBuffer / 2 : 3 * labelBuffer / 4}  dy={lineHeightScale(total) - 5} textAnchor={'middle'} fontSize={fontScale(total)} fill={brandColors.mediumGray} >
            {formatNumber(total)} households
            <tspan fill={getNumberColor(Math.round(100 * (total - totalLastYear) / totalLastYear))}>
              {' '}{total > totalLastYear ? '+' : ''}{Math.round(100 * (total - totalLastYear) / totalLastYear)}%
            </tspan>
          </text>
          <text x={svgWidth / 2} y={this.props.isReverse ? svgHeight - labelBuffer / 2 : 3 * labelBuffer / 4} dy={-5} textAnchor={'middle'} fontSize={fontScale(total)} >
            {this.props.name}
          </text>
          {
            categories.filter((d, i) => i === 2 ? hasForeign : (i === 1 ? hasNational : true)).map(({key, label}, i) => {
              const {cx1, cx2, cy1, cy2, width } = dataPoints[key];
              const bottomX = this.getBottomX(i, hasNational, hasForeign);
              return <g key={key}>
                  {/* <circle cx={bottomX} cy={svgHeight - labelBuffer / 2} fill={'none'} stroke={'black'} strokeWidth={3}r={labelBuffer / 2} /> */}

                  <text x={bottomX} y={this.props.isReverse ? 3 * labelBuffer / 4  : svgHeight - labelBuffer / 2} dy={0 * lineHeightScale(data[key]) - (lineHeightScale(data[key]))} fontSize={fontScale(data[key])} textAnchor={'middle'}  fill={brandColors.mediumGray}>
                    {formatNumber(data[key])}
                    <tspan fill={getNumberColor(Math.round(100 * (data[key] - data.lastYear[key]) / data.lastYear[key]))}>
                      {' '}{data[key] > data.lastYear[key] ? '+' : ''}{Math.round(100 * (data[key] - data.lastYear[key]) / data.lastYear[key])}%
                    </tspan>
                  </text>
                  {
                    label.split(' ').map((d, i) => {
                      return (
                        <g key={i}>
                          <text key={i} x={bottomX} y={this.props.isReverse ? 3 * labelBuffer / 4 : svgHeight - labelBuffer / 2} dy={(1 + i) * lineHeightScale(data[key]) - (lineHeightScale(data[key]))} fontSize={fontScale(data[key])} textAnchor={'middle'}>
                            {d}
                          </text>
                        </g>
                      )
                    })
                  }
                  <path key={key} d={this.drawCategoryPath(cx1, cy1, cx2, cy2, width, 10, i === 2 ? -dataPoints[categories[i - 1].key].width : 0)} fill={colors[i]} />
              </g>
            })
          }
        </SVG>
      </div>
    )
  }

}

export default Sankey;
