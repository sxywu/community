import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Graph from './visualizations/Graph';
import metadata from './data/metadata.json';

var width = 800;
var centerSize = 100;
var margin = {left: 20, top: 20};

var experienceScale = d3.scaleLinear();
var xScale = d3.scaleLinear()
	.range([0, width / 2 - centerSize]);
var colorScale = chroma
	.scale(['#53c3ac', '#7386e8', '#e68fc3']);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {survey: []};
  }

  componentWillMount() {
    var {frustration, experience, intended, intendedMap} = metadata;

    d3.csv(process.env.PUBLIC_URL + '/data/survey.csv', survey => {
      var xDomain = d3.extent(survey, d => ++d[experience]);
      experienceScale.domain(xDomain);

      // get the data ready
      survey = _.map(survey, (d, i) => {
        var exp = experienceScale(d[experience]);
        var frustrated = !!d[frustration];
        var focusX = (frustrated ? -1 : 1) * xScale(exp);
        focusX += (frustrated ? -1 : 1) * centerSize / 2;
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

      this.setState({survey});
    });
  }

  componentDidMount() {
    this.svg = d3.select(this.refs.svg)
     .attr('width', width)
     .attr('height', 1000);
  }

  render() {
    var props = {
      width,
      metadata,
      centerSize,
    };
    var questions = _.map(metadata.questions, (question, i) => {
      return (<Graph key={i} {...props} {...this.state} question={question} />);
    });

    return (
      <div className="App">
        <svg ref='svg'>
          {questions}
        </svg>
      </div>
    );
  }
}

export default App;
