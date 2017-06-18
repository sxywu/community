import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var defaultHeight = 50;
var radius = 3;
var fontSize = 12;
var padding = 20;
var hoverWidth = 250;

class Graph extends Component {
  constructor(props) {
    super(props);

    this.state = {hovered: {}}
    this.onTick = this.onTick.bind(this);
    this.updateHover = this.updateHover.bind(this);
  }

  componentWillMount() {
    this.simulation = d3.forceSimulation()
    	.force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.frustrated ? padding : -padding))
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
    this.axis = this.svg.append('g')
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')');

    this.hover = d3.select(this.refs.hover)
      .style('display', 'none');
  }

  componentDidUpdate() {
    if (!this.data) {
      var {answer, question} = this.props;
      question = question.question;
      this.data = _.chain(this.props.survey)
        .filter(d => d.data[question] && d.data[question] === answer)
        .map(d => {
          var y = (d.frustrated ? 1 : -1) * (d.intended ? _.random(padding, 100) : _.random(150, 200));
          return Object.assign({}, d, {y});
        }).value();
      this.renderCircles();
      this.renderLegend();
      this.renderAxis();

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
      .on('mouseover', this.updateHover)
      .on('mouseleave', d => this.hover.style('display', 'none'));
  }

  renderLegend() {

  }

  renderAxis() {
    this.axis.call(this.props.xAxis);
    this.axis.selectAll('path').remove();
    this.axis.selectAll('line').attr('stroke', '#999').attr('opacity', 0.5)
      .attr('y1', -padding / 2).attr('y2', padding / 2);
    this.axis.selectAll('text').attr('y', 0).attr('dy', '.35em');
  }

  onTick() {
    this.circles.attr('cx', d => d.x = Math.max(-this.props.width / 2, Math.min(this.props.width / 2, d.x)))
    	.attr('cy', d => d.y = d.frustrated ? Math.max(padding, d.y) : Math.min(-padding, d.y));

    var [minY, maxY] = d3.extent(this.data, d => d.y);
    var height = (maxY - minY) + padding;
    this.container.attr('transform', 'translate(' + [this.props.width / 2, height / 2] + ')');
    this.legend.attr('transform', 'translate(' + [this.props.width / 2, height / 2] + ')');
    this.axis.attr('transform', 'translate(' + [this.props.width / 2, height / 2] + ')');
    this.svg.attr('height', Math.max(defaultHeight, height));
  }

  updateHover(d) {
    var [x, y] = d3.mouse(this.refs.svg);
    var {frustration, intended, domain} = this.props.metadata;
    var html = d.data[frustration];
    this.hover
      .style('display', 'block')
      .style('top', (y + 10) + 'px')
      .style('left', (x - hoverWidth / 2) + 'px')
      .html(html);
  }

  render() {
    var style = {
      position: 'relative',
    };
    var hoverStyle = {
      position: 'absolute',
      padding: 20,
      boxShadow: '0 0 5px #ccc',
      backgroundColor: '#fff',
      width: hoverWidth,
      zIndex: 1000,
      lineHeight: 1.6,
    };

    return (
      <div style={style}>
        <svg ref='svg' width={this.props.width} style={{overflow: 'visible'}} />
        <div ref='hover' style={hoverStyle} />
      </div>
    );
  }
}

export default Graph;
