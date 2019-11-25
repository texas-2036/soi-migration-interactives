import React from 'react';
import { isIE } from '../utils/device';

class SVG extends React.Component {

  componentDidMount() {

  }

  render() {
    const { viewBox } = this.props;

    if (isIE() && viewBox) {
      const vbElts = viewBox.split(' ');
      const w = vbElts[2];
      const h = vbElts[3];

      return (
        <div style={{width: '100%'}}>
          <svg ref={_ref => {
            if (!_ref) {
              return;
            }
            const _w = _ref.parentNode.offsetWidth;
            _ref.style.width = _w + 'px';
            _ref.style.height = (_w * h / w) + 'px'
          }}
            preserveAspectRatio="xMidYMid" {...this.props} />
        </div>
      );
    }

    return <svg {...this.props} />;
  }
}

export default SVG;
