import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';

import Graph from './visualizations/Graph';
import metadata from './data/metadata.json';
import positions from './data/positions.json';

var width = 800;
var centerSize = 100;
var margin = {left: 40, right: 40, top: 20, bottom: 20};

var experienceScale = d3.scaleLinear();
var xScale = d3.scaleLinear().range([-width / 2 + margin.left, width / 2 - margin.right]);
var colorScale = chroma
	.scale(['#53c3ac', '#7386e8', '#e68fc3']);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {survey: []};
  }

  componentWillMount() {
    var {frustration, domain, intended, intendedMap} = metadata;

    d3.csv(process.env.PUBLIC_URL + '/data/survey.csv', survey => {
      var xDomain = d3.extent(survey, d => ++d[domain]);
      experienceScale.domain(xDomain);

      // get the data ready
      survey = _.map(survey, (d, i) => {
        var exp = experienceScale(d[domain]);
        var frustrated = !!d[frustration];
        var focusX = xScale(exp);
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
      return (<Graph key={i} {...props} {...this.state}
				positions={positions && positions[i]} question={question} />);
    });

    return (
      <div className="App">
        {questions}
      </div>
    );
  }
}

export default App;
