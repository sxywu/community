import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var barHeight = 12;
var padding = 5;

class Bars extends Component {

  componentDidMount() {
    this.svg = d3.select(this.refs.svg);
  }

  componentDidUpdate() {
    this.renderBars(this.props.data[0], 'right');
    this.renderBars(this.props.data[1], 'left');
  }

  renderBars(data, alignment) {
    var left = (this.props.width / 2) + (alignment === 'left' ? -1 : 1) * this.props.barWidth / 2;

    var allHistograms = this.svg.selectAll('allBins')
      .data(data.bars).enter().append('g')
      .attr('transform', (d, i) => 'translate(' + [left, i * barHeight] + ')');

    allHistograms.selectAll('rect')
      .data((d, i) => _.map(d.bars, (b, j) => b.length / d.totals[j].length))
      .enter().append('rect')
      .attr('x', d => alignment === 'left' ? 0 : -d * (this.props.barWidth / 2))
      .attr('y', (d, i) => i * (data.bars.length * barHeight + padding))
      .attr('width', (d, i) => d * (this.props.barWidth / 2))
      .attr('height', barHeight)

    allHistograms.append('text')
      .attr('y', barHeight / 2)
      .attr('dy', '.35em')
      .text((d, i) => data.bars[i].type)
  }

  render() {
    return (
      <svg ref='svg' className="Bars" width={this.props.width} height={this.props.height} />
    );
  }
}

export default Bars;
