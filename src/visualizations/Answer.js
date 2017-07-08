import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var defaultHeight = 50;
var radius = 3;
var padding = 20;

class Answer extends Component {
  constructor(props) {
    super(props);

    this.state = {hovered: {}}
    this.onTick = this.onTick.bind(this);
    this.updateBrush = this.updateBrush.bind(this);
  }

  componentWillMount() {
    this.brush = d3.brush().on('end', this.updateBrush);
    this.simulation = d3.forceSimulation()
    	.force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.frustrated ? padding : -padding))
    	.force('collide', d3.forceCollide().radius(radius))
    	.on('tick', this.onTick)
      .stop();
  }

  componentDidMount() {
    this.header = d3.select(this.refs.header);
    this.svg = d3.select(this.refs.svg).attr('height', defaultHeight);
    this.container = this.svg.append('g')
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')');
    this.legend = this.svg.append('g')
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')');
    this.axis = this.svg.append('g')
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')');
    this.brushG = this.svg.append('g')
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')')
      .call(this.brush);

    if (this.props.survey.length) {
      // if survey responses have loaded
      this.renderAll();
    }
  }

  shouldComponentUpdate(nextProps) {
    this.renderHeader(nextProps.brushed);
    // if being brushed, update circle opacity
    this.circles && this.circles.attr('opacity', d =>
      nextProps.brushed.nodes[d.id] ? 1 : 0.1);
    // also if answer isn't the one being brushed, clear the brush
    if (nextProps.brushed.answers.length &&
      (!nextProps.brushed.answers[this.props.index] ||
        (nextProps.brushed.answers[this.props.index] &&
        nextProps.brushed.answers[this.props.index][0] !== nextProps.answerKey))) {
      this.programaticallyClearBrush = true;
      this.brushG.call(this.brush.move, null);
    }

    return !this.data || nextProps.answerKey !== this.props.answerKey;
  }

  componentDidUpdate() {
    this.renderAll();
  }

  renderAll() {
    var {answer, question, brushed} = this.props;
    question = question.question;
    this.data = _.chain(this.props.survey)
      .filter(d => d.data[question] && d.data[question] === answer)
      .map(d => {
        var y = (d.frustrated ? 1 : -1) * (d.intended ? _.random(0, padding) : _.random(2 * padding, 3 * padding));
        return Object.assign({}, d, {y});
      }).value();

    this.renderHeader(brushed);
    this.renderCircles();
    this.renderLegend();
    this.renderAxis();

    this.simulation.nodes(this.data)
    	.alpha(0.75).restart();
  }

  renderHeader(brushed) {
    var happy = 0;
    var frustrated = 0;
    _.each(this.data, d => {
      // if the node isn't brushed, skip to next one
      if (!brushed.nodes[d.id]) return;
      if (d.frustrated) {
        frustrated += 1;
      } else {
        happy += 1;
      }
    });

    var html = '<h4 style="margin:0;margin-bottom:5px">' + this.props.answerVal + '</h4>';
    html += '<sup>(' + happy + ' + ' + frustrated + ' = ' + (happy + frustrated) + ')</sup>';
    this.header.html(html);
  }

  renderCircles() {
    // draw the circles
    var data = _.chain(this.data).groupBy(d => d.frustrated).values().value();
    this.groups = this.container.selectAll('.dot').data(data);

    this.groups.exit().remove();

    var enter = this.groups.enter().append('g')
      .classed('dot', true);
    this.groups = enter.merge(this.groups)
      // .attr('transform', d => 'translate(' + [0, (d[0].frustrated ? 1 : -1) * padding] + ')');

    this.circles = this.groups.selectAll('circle')
      .data(d => d, d => d.id);
    this.circles.exit().remove();

    this.circles = this.circles.enter().append('circle')
    	.attr('r', radius)
    	.attr('stroke-width', 2)
      .attr('fill-opacity', 0.5)
      .merge(this.circles)
    	.attr('fill', d => d.intended ? d.color : '#fff')
    	.attr('stroke', d => d.color)
      .attr('opacity', d => this.props.brushed.nodes[d.id] ? 1 : 0.1);
  }

  renderLegend() {
    var radius = padding / 4;
    var data = _.chain(this.data)
      .groupBy(d => d.frustrated)
      .map((nodes) => {
        var y = (nodes[0].frustrated ? padding: -padding) * 0.6;
        var xArray = _.chain(nodes).map(node => node.x).sortBy().value();
        var q0 = d3.quantile(xArray, 0);
        var q1 = d3.quantile(xArray, 0.25);
        var q2 = d3.quantile(xArray, 0.5);
        var q3 = d3.quantile(xArray, 0.75);
        var q4 = d3.quantile(xArray, 1);
        var q1Color = this.props.colorScale(this.props.xScale.invert(q1));
        var q3Color = this.props.colorScale(this.props.xScale.invert(q3));

        return {
          y,
          lines: [
            [q0, q4, 1, '#000'],
            [q1, q2, radius, q1Color],
            [q2, q3, radius, q3Color],
            [q2 - 1, q2 + 1, radius, '#000'],
          ],
          circles: [],
        };
      }).value();

    var legend = this.legend.selectAll('g').data(data);
    legend.exit().remove();
    var enter = legend.enter().append('g');
    legend = enter.merge(legend)
      .attr('transform', d => 'translate(' + [0, d.y] + ')');

    var lines = legend.selectAll('line').data(d => d.lines);
    lines.exit().remove();
    lines.enter().append('line')
      .style('shape-rendering', 'cripEdges')
      .merge(lines)
      .attr('x1', d => d[0])
      .attr('x2', d => d[1])
      .attr('stroke', d => d[3])
      .attr('stroke-width', d => d[2]);

    var circles = legend.selectAll('circle').data(d => d.circles);
    circles.exit().remove();
    circles.enter().append('circle')
      .attr('stroke', '#000')
      .merge(circles)
      .attr('cx', d => d[0])
      .attr('r', d => d[1])
      .attr('fill', d => d[2]);
  }

  renderAxis() {
    this.axis.call(this.props.xAxis);
    this.axis.selectAll('path').remove();
    this.axis.selectAll('line').remove();
    this.axis.selectAll('text').attr('y', 0).attr('dy', '.35em');
  }

  onTick() {
    this.circles.attr('cx', d => d.x = Math.max(-this.props.width / 2, Math.min(this.props.width / 2, d.x)))
    	.attr('cy', d => d.y = d.frustrated ? Math.max(padding, d.y) : Math.min(-padding, d.y));

    var [minY, maxY] = d3.extent(this.data, d => d.y);
    var height = (maxY - minY) + padding;
    var middle = -minY + padding / 2;
    this.container.attr('transform', 'translate(' + [this.props.width / 2, middle] + ')');
    this.legend.attr('transform', 'translate(' + [this.props.width / 2, middle] + ')');
    this.axis.attr('transform', 'translate(' + [this.props.width / 2, middle] + ')');

    this.brush.extent([[-this.props.width / 2, minY - padding / 2],
      [this.props.width / 2, maxY + padding / 2]]);
    this.brushG.attr('transform', 'translate(' + [this.props.width / 2, middle] + ')')
      .call(this.brush);

    this.svg.attr('height', Math.max(defaultHeight, height));
  }

  updateBrush() {
    if (this.programaticallyClearBrush) {
      this.programaticallyClearBrush = false;
      return;
    }
    var filtered;
    if (d3.event.selection) {
      var [[x1, y1], [x2, y2]] = d3.event.selection;
      filtered = _.chain(this.data)
        .filter(d => x1 <= d.x && d.x <= x2 && y1 <= d.y && d.y <= y2)
        .reduce((obj, d) => {
          obj[d.id] = d.id;
          return obj;
        }, {}).value();
    }

    this.props.updateBrush(this.props.answerKey, filtered, this.props.index);
  }

  render() {
    return (
      <div>
        <div ref='header' style={{marginTop: 20}} />
        <svg ref='svg' width={this.props.width} style={{overflow: 'visible'}} />
      </div>
    );
  }
}

export default Answer;
