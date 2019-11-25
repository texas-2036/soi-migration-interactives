import React from 'react';
import { uiColors } from '../utils/colors'
import Path from 'svg-path-generator';
import SVG from './svg';


class TriangleIndicator extends React.Component {

  render() {
    const { width, height, direction } = this.props;
    const IS_UP = direction > 0;

    let d;
    if (IS_UP) {
      d = Path()
        .moveTo(0, height)
        .lineTo(width / 2, 0)
        .lineTo(width, height)
        .close()
        .end()
    } else {
      d = Path()
        .moveTo(0, 0)
        .lineTo(width / 2, height)
        .lineTo(width, 0)
        .close()
        .end()
    }

    return (
      <SVG width={width} height={height}>
        <path
          d={d}
          fill={IS_UP ? uiColors.positive : uiColors.negative}
        />
      </SVG>
    )
  }
}


export default TriangleIndicator;
