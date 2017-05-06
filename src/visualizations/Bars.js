import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var perWidth = 2;
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
    var allBins = _.map(data.bars, d => d3.histogram().domain([0, 100]).thresholds(10)(d.bars));

    var allHistograms = this.svg.selectAll('allBins')
      .data(allBins).enter().append('g')
      .attr('transform', (d, i) => 'translate(' + [left, i * barHeight] + ')');

    allHistograms.selectAll('rect')
      .data(d => d).enter().append('rect')
      .attr('x', d => alignment === 'left' ? 0 : -d.length * perWidth)
      .attr('y', (d, i) => i * (allBins.length * barHeight + padding))
      .attr('width', d => d.length * perWidth)
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
