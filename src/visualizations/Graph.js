import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var radius = 3;
var answerHeight = 100;

class Graph extends Component {
  constructor(props) {
    super(props);

    this.onTick = this.onTick.bind(this);
  }

  componentWillMount() {
    this.simulation = d3.forceSimulation()
    	.force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.focusY))
    	.force('collide', d3.forceCollide().radius(radius))
    	.on('tick', this.onTick)
    	.stop();
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container)
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')');
  }

  componentDidUpdate() {
    if (!this.data) {
      var {question, answers} = this.props.question;
      this.data = _.map(this.props.survey, d => {
        var [order, answer] = answers[d.data[question]];
        var focusY = (order + 0.5) * answerHeight;
        return Object.assign({}, d, {
          focusY,
          y: focusY + (d.intended ? -1 : 1) * _.random(this.props.centerSize / 4, this.props.centerSize / 2),
        });
      });

      this.renderCircles();
    }
  }

  renderCircles() {
    // draw the circles
    this.circles = this.container.selectAll('circle')
    	.data(this.data, d => d.id)
      .enter().append('circle')
    	.attr('r', radius)
    	.attr('fill', d => d.intended ? d.color : '#fff')
    	.attr('stroke', d => d.color)
    	.attr('stroke-width', 2);

    this.simulation.nodes(this.data)
    	.alpha(0.9).restart();
  }

  onTick() {
    this.circles.attr('cx', d => d.x)
    	.attr('cy', d => d.y);
  }

  render() {

    return (
      <g ref='container' />
    );
  }
}

export default Graph;