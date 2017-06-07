import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var radius = 3;
var answerHeight = 200;
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
      .force('y', d3.forceY().y(d => d.focusY))
    	.force('collide', d3.forceCollide().radius(radius))
    	.on('tick', this.onTick)
      .on('end', () => {
        var data = _.map(this.data, d => {
          return {
            id: d.id,
            x: d.x,
            y: d.y - d.focusY,
          }
        });
        console.log('\n\n\n\n\n' + JSON.stringify(data))
      })
    	.stop();
  }

  componentDidMount() {
    this.svg = d3.select(this.refs.svg);
    this.container = d3.select(this.refs.container)
      .attr('transform', 'translate(' + [this.props.width / 2, 0] + ')');
  }

  componentDidUpdate() {
    if (!this.data) {
      var {question, answers} = this.props.question;
      var answersArray = _.sortBy(answers, d => d[0]);
      // console.log(_.countBy(this.props.survey, d => d.data[question]))

      var positionsById = this.props.positions && _.keyBy(this.props.positions, 'id');
      var totalY = 0;
      this.answers = [];
      this.data = _.chain(this.props.survey)
        .filter(d => answers[d.data[question]])
        .map(d => {
          var [order, answer] = answers[d.data[question]];
          if (!this.props.positions) {
            // if positions don't exist, prep for force layout
            var focusY = order * answerHeight + (d.frustrated ? 0.75 : 0.25) * answerHeight;
            return Object.assign({}, d, {
              order,
              focusY,
              y: focusY + (d.intended ? -1 : 1) * _.random(0, answerHeight / 2),
            });
          } else {
            var {x, y} = positionsById[d.id];
            return Object.assign({}, d, {order, x, y});
          }
        }).groupBy(d => d.order + (d.frustrated ? 't' : 'f'))
        .sortBy(d => d[0].order)
        .map((d) => {
          var order = d[0].order;
          if (!this.props.positions) {
            this.answers.push({y: order * answerHeight + fontSize, text: answersArray[order][1]});
            return {y: 0, dots: d};
          } else {
            if (d[0].frustrated) {
              // if it's the first one in the group, then add in as answer
              this.answers.push({y: totalY + 1.5 * fontSize, text: answersArray[order][1]});
              totalY += 3 * fontSize;
            }

            // calculate each group height
            var [y1, y2] = d3.extent(d, d => d.y);
            var height = y2 - y1;
            var y = totalY + height / 2;
            totalY += height + padding;

            // calculate group box plot
            var percents = _.chain(d).map(d => d.x).sortBy().value();
            var quartiles = [
              d3.quantile(percents, 0), d3.quantile(percents, 0.25),
              d3.quantile(percents, 0.5), d3.quantile(percents, 0.75),
              d3.quantile(percents, 1),
            ];
            var box = {
              height,
              lines: [[quartiles[0], quartiles[1]], [quartiles[3], quartiles[4]]],
              box: [quartiles[1], quartiles[3]],
              median: quartiles[2],
            };

            return {y, dots: d, box};
          }
        }).value();

      // set the svg height
      this.svg.attr('height', totalY);
        console.log(this.data, this.answers)
      this.renderCircles();
      this.renderAnswer();

      if (!this.props.positions) {
        this.simulation.nodes(this.data)
        	.alpha(0.9).restart();
      }
    }
  }

  renderCircles() {
    // draw the circles
    this.groups = this.container.selectAll('.dot').data(this.data);

    this.groups.exit().remove();

    var enter = this.groups.enter().append('g')
      .classed('dot', true);
    this.groups = enter.merge(this.groups)
      .attr('transform', d => 'translate(' + [0, d.y] + ')');

    this.circles = this.groups.selectAll('circle')
      .data(d => d.dots, d => d.id);
    this.circles.exit().remove();

    this.circles = this.circles.enter().append('circle')
    	.attr('r', radius)
    	.attr('stroke-width', 2)
      .attr('stroke-opacity', 0.75)
      .attr('fill-opacity', 0.5)
      .merge(this.circles)
    	.attr('fill', d => d.intended ? d.color : '#fff')
    	.attr('stroke', d => d.color)
      .attr('cx', d => d.x)
    	.attr('cy', d => d.y);

      // box plot only if positions are saved
      if (this.props.positions) {
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
  }

  renderAnswer() {
    var answer = this.container.selectAll('.label')
      .data(_.values(this.answers), d => d.text);

    answer.exit().remove();

    answer.enter().append('text')
      .classed('label', true)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .merge(answer)
      .attr('y', d => d.y)
      .text(d => d.text);
  }

  onTick() {
    this.circles.attr('cx', d => d.x)
    	.attr('cy', d => d.y);
  }

  render() {
    var style = {
      width: this.props.width,
      textAlign: 'center',
      margin: 20,
    };
    var headerStyle = {
      width: this.props.width * 0.75,
      margin: 'auto',
      fontStyle: 'italic',
      lineHeight: 1.6,
    };
    var {questionMap} = this.props.question;

    return (
      <div style={style}>
        <h3 style={headerStyle}>{questionMap}</h3>
        <svg ref='svg' width={this.props.width}>
          <g ref='container' />
        </svg>
      </div>
    );
  }
}

export default Graph;
