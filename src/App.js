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
    this.state = {survey: [], brushed: {}};
		this.updateBrush = this.updateBrush.bind(this);
  }

  componentWillMount() {
    var {frustration, domain, intended, intendedMap, questions} = metadata;
		_.each(questions, (question, i) => {
			_.each(question.answers, (answer) => {
				answer.push(i + ',' + answer[0]);
			});
		});

    d3.csv(process.env.PUBLIC_URL + '/data/survey.csv', survey => {
      var xDomain = d3.extent(survey, d => d[domain] = ++d[domain] - 1);
      experienceScale.domain(xDomain);

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

  render() {
    var props = {
      width,
      metadata,
      centerSize,
			xAxis,
			xScale,
			colorScale,
			updateBrush: this.updateBrush,
    };
		var graphStyle = {
			width: 2 * width,
			margin: '20px auto',
			boxShadow: '0 0 5px #ccc',
			border: '1px solid #ccc',
			padding: '40px 20px',
		};
		var cards = _.chain(this.state.brushed.nodes)
			.values().take(20)
			.map(id => {
				return (
					<div>{this.surveyById[id].data[metadata.frustration]}</div>
				);
			}).value();
    return (
      <div className="App">
				<div style={graphStyle}>
					<Graph {...props} {...this.state} question={metadata.questions[0]} />
					<Graph {...props} {...this.state} question={metadata.questions[1]} />
				</div>
				<div>
					{cards}
				</div>
      </div>
    );
  }
}

export default App;
