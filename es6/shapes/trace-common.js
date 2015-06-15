const BaseShape = require('./base-shape');

class TraceCommon extends BaseShape {
  _getDefaults() {
    return {
      rangeColor: 'steelblue',
      meanColor: '#232323',
      displayMean: true
    };
  }

  render(renderingContext) {
    if (this.shape) { return this.shape; }
    this.shape = document.createElementNS(this.ns, 'g')
    // range path
    this.rangeZone = document.createElementNS(this.ns, 'path');
    this.shape.appendChild(this.rangeZone);

    // mean line
    if (this.params.displayMean) {
      this.meanLine = document.createElementNS(this.ns, 'path');
      this.shape.appendChild(this.meanLine);
    }

    return this.shape;
  }

  // @TODO use accessors
  update(renderingContext, group, data) {
    // order data by x position
    data = data.slice(0);
    data.sort((a, b) => a.x < b.x ? -1 : 1);

    if (this.params.displayMean) {
      this.meanLine.setAttributeNS(null, 'd', this._buildMeanLine(renderingContext, data));
      this.meanLine.setAttributeNS(null, 'stroke', this.params.meanColor);
      this.meanLine.setAttributeNS(null, 'fill', 'none');
    }

    this.rangeZone.setAttributeNS(null, 'd', this._buildRangeZone(renderingContext, data));
    this.rangeZone.setAttributeNS(null, 'stroke', 'none');
    this.rangeZone.setAttributeNS(null, 'fill', this.params.rangeColor);
    this.rangeZone.setAttributeNS(null, 'opacity', '0.4');

    data = null;
  }

  _buildMeanLine(renderingContext, data) {
    let instructions = data.map((datum, index) => {
      const x = renderingContext.xScale(datum.x);
      const y = renderingContext.yScale(datum.mean);
      return `${x},${y}`;
    });

    return 'M' + instructions.join('L');
  }

  _buildRangeZone(renderingContext, data) {
    const length = data.length;
    // const lastIndex = data
    let instructionsStart = '';
    let instructionsEnd = '';

    for (let i = 0; i < length; i++) {
      const datum = data[i];
      const halfRange = datum.range / 2;
      const x = renderingContext.xScale(datum.x);
      const y0 = renderingContext.yScale(datum.mean + halfRange);
      const y1 = renderingContext.yScale(datum.mean - halfRange);

      const start = `${x},${y0}`;
      const end = `${x},${y1}`;

      instructionsStart = instructionsStart === '' ? start : `${instructionsStart}L${start}`;
      instructionsEnd = instructionsEnd === '' ? end : `${end}L${instructionsEnd}`;
    }

    let instructions = `M${instructionsStart}L${instructionsEnd}Z`;
    return instructions;
  }
}

module.exports = TraceCommon;
