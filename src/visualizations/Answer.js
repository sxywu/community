import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var defaultHeight = 50;
var radius = 3;
var fontSize = 12;
var padding = 20;

class Graph extends Component {
  constructor(props) {
    super(props);

    this.onTick = this.onTick.bind(this);
  }

  componentWillMount() {
    this.simulation = d3.forceSimulation()
    	.force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY(0))
    	.force('collide', d3.forceCollide().radius(radius))
    	.on('tick', this.onTick)
      .stop();
  }

  componentDidMount() {
    this.svg = d3.select(this.refs.svg).attr('height', defaultHeight);
    this.container = this.svg.append('g')
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')');
    this.legend = this.svg.append('g')
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')');
  }

  componentDidUpdate() {
    if (!this.data) {
      var {answer, question} = this.props;
      question = question.question;
      this.data = _.chain(this.props.survey)
        .filter(d => d.data[question] && d.data[question] === answer)
        .map(d => {
          var y = (d.frustrated ? 1 : -1) * (d.intended ? 100 : 200);
          return Object.assign({}, d, {y});
        }).value();
      this.renderCircles();

      this.simulation.nodes(this.data)
      	.alpha(0.75).restart();
    }
  }

  renderCircles() {
    // draw the circles
    var data = _.chain(this.data).groupBy(d => d.frustrated).values().value();
    this.groups = this.container.selectAll('.dot').data(data);

    this.groups.exit().remove();

    var enter = this.groups.enter().append('g')
      .classed('dot', true);
    this.groups = enter.merge(this.groups)
      .attr('transform', d => 'translate(' + [0, (d[0].frustrated ? 1 : -1) * padding] + ')');

    this.circles = this.groups.selectAll('circle')
      .data(d => d, d => d.id);
    this.circles.exit().remove();

    this.circles = this.circles.enter().append('circle')
    	.attr('r', radius)
    	.attr('stroke-width', 2)
      .attr('fill-opacity', 0.5)
      .merge(this.circles)
    	.attr('fill', d => d.intended ? d.color : '#fff')
    	.attr('stroke', d => d.color);
  }

  renderLegend(enter) {
    // box plot only if positions are saved
      var box = enter.append('g')
        .attr('fill', 'none')
        .attr('stroke', '#333');

      var lines = box.selectAll('.line')
        .data(d => d.box.lines);
      lines.exit().remove();
      lines.enter().append('line')
        .classed('line', true)
        .merge(lines)
        .attr('x1', d => d[0])
        .attr('x2', d => d[1]);

      // the box
      box.append('rect')
        .classed('box', true);
      box.select('.box')
        .datum(d => d.box)
        .attr('x', d => d.box[0])
        .attr('width', d => d.box[1] - d.box[0])
        .attr('y', -1)
        .attr('height', 2)
        .attr('fill', '#000');

      // the median
      box.append('line')
        .classed('median', true);
      box.select('.median')
        .datum(d => d.box)
        .attr('x1', d => d.median)
        .attr('x2', d => d.median)
        .attr('y1', d => -d.height / 2)
        .attr('y2', d => d.height / 2);
  }

  onTick() {
    this.circles.attr('cx', d => d.x)
    	.attr('cy', d => d.y = d.frustrated ? Math.max(0, d.y) : Math.min(0, d.y));

    var [minY, maxY] = d3.extent(this.data, d => d.y);
    var height = (maxY - minY) + 2.5 * padding;
    this.container.attr('transform', 'translate(' + [this.props.width / 2, height / 2] + ')');
    this.svg.attr('height', Math.max(defaultHeight, height));
  }

  render() {
    var style = {
      overflow: 'visible',
    };
    return (
      <svg ref='svg' width={this.props.width} style={style}>
      </svg>
    );
  }
}

export default Graph;
