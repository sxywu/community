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
	.range([width / 2 - centerSize, 0]);
var colorScale = chroma
	.scale(['#53c3ac', '#7386e8', '#e68fc3']);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {survey: []};
  }

  componentWillMount() {
    var {frustration, percentday, intended, intendedMap} = metadata;

    d3.csv(process.env.PUBLIC_URL + '/data/survey.csv', survey => {
      var xDomain = d3.extent(survey, d => ++d[percentday]);
      experienceScale.domain(xDomain);

      // get the data ready
      survey = _.map(survey, (d, i) => {
        var exp = experienceScale(d[percentday]);
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
        {questions}
      </div>
    );
  }
}

export default App;
