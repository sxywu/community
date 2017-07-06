import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Graph from './visualizations/Graph';
import metadata from './data/metadata.json';
import positions from './data/positions.json';

var width = 600;
var centerSize = 100;
var margin = {left: 40, right: 40, top: 20, bottom: 20};

var experienceScale = d3.scaleLinear();
var xScale = d3.scaleLinear().range([-width / 2 + margin.left, width / 2 - margin.right]);
var xAxis = d3.axisBottom().scale(xScale)
	.tickSizeOuter(0).tickFormat(d3.format('.0%'));
var colorScale = chroma.scale(['#53c3ac', '#7386e8', '#e68fc3']);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
			survey: [],
			brushed: {},
			questions: [metadata.questions[0], metadata.questions[1]]
		};
		this.updateBrush = this.updateBrush.bind(this);
		this.updateQuestion = this.updateQuestion.bind(this);
  }

  componentWillMount() {
    var {frustration, domain, intended, intendedMap, questions} = metadata;
		_.each(questions, (question, i) => {
			question.index = i;
			_.each(question.answers, (answer) => {
				answer.push(i + ',' + answer[0]);
			});
		});

    d3.csv(process.env.PUBLIC_URL + '/data/survey.csv', survey => {
      var xDomain = d3.extent(survey, d => d[domain] = ++d[domain] - 1);
      experienceScale.domain(xDomain);

			// // console all the answers
			// _.each(questions, question => {
			// 	console.log(question.question, _.countBy(survey, d => d[question.question]));
			// });

      // get the data ready
      survey = _.map(survey, (d, i) => {
        var exp = experienceScale(d[domain]);
        var focusX = xScale(exp);
        var frustrated = !!d[frustration];
        var intend = intendedMap[d[intended]];

        return {
          frustrated,
          intended: intend,
          focusX,
          x: focusX,
          color: colorScale(exp),
          data: d,
          id: i,
        }
      });
			this.surveyById = _.keyBy(survey, 'id');
			var brushed = {
				answer: null,
				nodes: _.reduce(survey, (obj, d) => {
	        obj[d.id] = d.id;
	        return obj;
	      }, {}),
			};

      this.setState({survey, brushed});
    });
  }

	updateBrush(answer, nodes) {
		this.setState({brushed: {answer, nodes}});
	}

	updateQuestion(d) {
		console.log(d)
		var questions = this.state.questions;
		questions[d.index] = d.question;
		this.setState({questions});
	}

  render() {
    var props = {
      width,
      metadata,
      centerSize,
			xAxis,
			xScale,
			colorScale,
			updateBrush: this.updateBrush,
			updateQuestion: this.updateQuestion,
    };
		var graphStyle = {
			width: 2 * width,
			margin: '60px auto',
		};

		var padding = 15;
		var total = this.state.brushed.nodes && _.size(this.state.brushed.nodes);
		var q1 = this.state.questions[0];
		var q2 = this.state.questions[1];

		var cards = _.chain(this.state.brushed.nodes)
			.values().take(20)
			.sortBy(id => -this.surveyById[id].data[metadata.domain])
			.map((id, i) => {
				var style = {
					width: (2 * width - 8 * padding) / 3 - 2,
					padding: padding,
					marginRight: (i % 3 === 2) ? 0 : padding,
					marginBottom: padding,
					border: '1px solid #333',
					display: 'inline-block',
					verticalAlign: 'top',
					lineHeight: 1.6,
				};
				var answerData = this.surveyById[id].data;
				var q1Answer = q1.answers[answerData[q1.question]];
				var q2Answer = q2.answers[answerData[q2.question]];
				return (
					<div style={style}>
						<center><em>{i + 1}.</em></center><br />
						<strong>{q1.questionMap}: </strong>
						{_.isArray(q1Answer) ? q1Answer[1] : 'N/A'}
						<br />
						<strong>{q2.questionMap}: </strong>
						{_.isArray(q2Answer) ? q2Answer[1] : 'N/A'}
						<br />
						<strong>{metadata.domainMap}: </strong>
						{answerData[metadata.domain]}%
						<br />
						<strong>Frustration: </strong>
						{answerData[metadata.frustration] || 'N/A'}
						<br />
					</div>
				);
			}).value();

    return (
      <div className="App">
				<div style={graphStyle}>
					<Graph {...props} {...this.state}
						index={0} question={this.state.questions[0]} />
					<Graph {...props} {...this.state}
						index={1} question={this.state.questions[1]} />
				</div>
				<div style={{width: 2 * width, margin: 'auto'}}>
					<center><em>Showing {cards.length} out of {total}</em></center><br />
					{cards}
				</div>
      </div>
    );
  }
}

export default App;
