import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Intro from './Intro';
import Graph from './visualizations/Graph';
import metadata from './data/metadata.json';
import legendImage from './images/legend.png';
import boxplotImage from './images/boxplot.png';
import dotsImage from './images/dots.png';

var width = 600;
var centerSize = 100;
var margin = {left: 40, right: 40, top: 20, bottom: 20};

var experienceScale = d3.scaleLinear();
var xScale = d3.scaleLinear().range([-width / 2 + margin.left, width / 2 - margin.right]);
var xAxis = d3.axisBottom().scale(xScale)
	.tickSizeOuter(0).tickFormat(d3.format('.0%'));
var colorScale = chroma.scale(['#53c3ac', '#7386e8', '#e68fc3']);

class Cards extends Component {

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
		};

    this.clickBefore = this.clickBefore.bind(this);
    this.clickNext = this.clickNext.bind(this);
  }

  clickBefore() {
    this.setState({index: this.state.index - 1});
  }

  clickNext() {
    this.setState({index: this.state.index + 1});
  }

  render() {
    var cardsStyle = {
      width: 2 * width,
      margin: '0 auto 120px',
    };

		var padding = 15;
		var total = this.props.brushed.nodes && _.size(this.props.brushed.nodes);
		var q1 = this.props.questions[0];
		var q2 = this.props.questions[1];
    var surveyById = _.keyBy(this.props.survey, 'id');

    var perPage = 12;
    var start = this.state.index * perPage;
    var end = Math.max(start + perPage);
		var cards = _.chain(this.props.brushed.nodes)
			.values().slice(start, end)
			.sortBy(id => -surveyById[id].data[metadata.domain])
			.map((id, i) => {
				var style = {
					width: (2 * width - 8 * padding) / 3 - 2,
					padding: padding,
					marginRight: (i % 3 === 2) ? 0 : padding,
					// marginBottom: padding,
					display: 'inline-block',
					verticalAlign: 'top',
					lineHeight: 1.6,
				};
				var answerData = surveyById[id].data;
				var q1Answer = q1.answers[answerData[q1.question]];
				var q2Answer = q2.answers[answerData[q2.question]];
				return (
					<div key={i} style={style}>
						<h4 style={{borderBottom: '1px solid'}}>
							<em>{i + 1}.</em>
						</h4>

						<strong>{q1.questionMap} </strong><br />
						{_.isArray(q1Answer) ? q1Answer[1] : 'N/A'}
						<br />
						<strong>{q2.questionMap} </strong><br />
						{_.isArray(q2Answer) ? q2Answer[1] : 'N/A'}
						<br />
						<strong>{metadata.domainMap} </strong><br />
						{answerData[metadata.domain]}%

						<br /><br />
						<strong>Biggest frustration(s) </strong><br />
						{answerData[metadata.frustration] || 'N/A'}
					</div>
				);
			}).value();

    return (
      <div className="Cards" style={cardsStyle}>
				<div style={{textAlign: 'center'}}>
					<h2>Brush one or both questions to filter</h2>
          <p>
  					<span onClick={this.clickBefore}>←</span>
            <em> {start + 1} - {end} </em>
            <span onClick={this.clickNext}>→</span>
          </p>
          <em>out of {total}</em>
				</div>
				{cards}
      </div>
    );
  }
}

export default Cards;
