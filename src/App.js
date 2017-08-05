import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Intro from './Intro';
import Graph from './visualizations/Graph';
import Cards from './Cards';
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
					frustration: d[frustration],
          intended: intend,
          focusX,
          x: focusX,
          color: colorScale(exp),
          data: d,
          id: i,
        }
      });
			var allNodes = _.reduce(survey, (obj, d) => {
				obj[d.id] = d.id;
				return obj;
			}, {});
			var brushed = {
				answers: [],
				nodes: allNodes,
				allNodes,
			};

      this.setState({survey, brushed});
    });
  }

	updateBrush(answer, newNodes, index) {
		var answers = this.state.brushed.answers;
		var allNodes = this.state.brushed.allNodes;

		// get the nodes from the other question
		var otherNodes = answers[index ? 0 : 1];
		otherNodes = otherNodes && otherNodes[1];
		var nodes;
		if (!otherNodes && !newNodes) {
			// if both are cleared, show all nodes again
			nodes = allNodes;
		} else if (!otherNodes) {
			// if there's no nodes brushed in other question, so just keep with this one
			nodes = newNodes;
		} else if (!newNodes) {
			// if there are no new nodes, use the other nodes
			nodes = otherNodes;
		} else {
			nodes = _.reduce(newNodes, (obj, node) => {
				// basically calculate intersection but for an object
				if (otherNodes[node]) obj[node] = node;
				return obj;
			}, {});
		}

		answers[index] = newNodes ? [answer, newNodes] : null;
		this.setState({brushed: {answers, nodes, allNodes}});
	}

	updateQuestion(d) {
		var questions = this.state.questions;
		questions[d.index] = d.question;

		// reset the brush for that question
		var answers = this.state.brushed.answers;
		var allNodes = this.state.brushed.allNodes;
		var otherNodes = answers[d.index ? 0 : 1];
		otherNodes = otherNodes && otherNodes[1];
		var nodes;
		if (!otherNodes) {
			nodes = allNodes;
		} else {
			nodes = otherNodes;
		}
		answers[d.index] = null;

		this.setState({questions, brushed: {answers, nodes, allNodes}});
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

		var legendStyle = {
			width: 700,
			margin: '0 auto 20px',
		};
		var graphStyle = {
			width: 2 * width,
			margin: '0 auto 60px',
		};
		var footerStyle = {
			width: 2 * width,
			margin: '0 auto 20px',
			textAlign: 'center',
		}

		var q1 = this.state.questions[0];
		var q2 = this.state.questions[1];

    return (
      <div className="App">
				<Intro {...this.state} />

				<div style={legendStyle}>
					<h2 style={{textAlign: 'center'}}>How to read the visualization</h2>

					<div style={{position: 'relative', width: 18, margin: 'auto'}}>
						<img src={dotsImage} alt='How to read graph' />
						<sup style={{position: 'absolute', width: 350, left: 24, top: 0}}>
							← set out to work in data visualization
						</sup>
						<sup style={{position: 'absolute', width: 350, left: 24, top: 18}}>
							← did not set out to work in data visualization
						</sup>
					</div>

					<div style={{position: 'relative', width: 350, margin: 'auto'}}>
						<img src={boxplotImage} alt='How to read graph' />
						<sup style={{position: 'absolute', textAlign: 'center', left: 140, top: 20}}>
							↑<br />
							q1
						</sup>
						<sup style={{position: 'absolute', textAlign: 'center', left: 254, top: 20}}>
							↑<br />
							median
						</sup>
						<sup style={{position: 'absolute', textAlign: 'center', left: 320, top: 20}}>
							↑<br />
							q3
						</sup>
					</div>

					<div style={{position: 'relative'}}>
						<img src={legendImage} alt='How to read graph' />
						<sup style={{position: 'absolute', width: '100%', left: 360, top: 16}}>
							← responded with <em>no</em> frustrations
						</sup>
						<sup style={{position: 'absolute', width: '100%', left: 360, top: 33}}>
							← % of day respondent spends on data visualization
						</sup>
						<sup style={{position: 'absolute', width: '100%', left: 360, top: 50}}>
							← responded <em>with</em> frustrations
						</sup>
					</div>
				</div>

				<div style={graphStyle}>
					<Graph {...props} {...this.state}
						index={0} question={this.state.questions[0]} />
					<Graph {...props} {...this.state}
						index={1} question={this.state.questions[1]} />
				</div>

				<Cards {...this.state} {...props} />

        <div style={footerStyle}>
					<sup>
Catmule Caps by <a href='https://twitter.com/catmule' target='_new'>Catherine Madden</a><br />
visualization made with <span role="img" aria-label="heart">💖</span> for <a href='http://www.datasketch.es/april/' target='_new'>April</a>: <a href='http://www.datasketch.es/' target='_new'>datasketch|es</a><br />
a monthly collaboration between <a href='https://twitter.com/nadiehbremer' target='_new'>Nadieh Bremer</a> and <a href='https://twitter.com/sxywu' target='_new'>Shirley Wu</a>
					</sup>
				</div>
      </div>
    );
  }
}

export default App;
