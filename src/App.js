import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import Bars from './visualizations/Bars';

var surveyQs = {
  percents: {
    // dataeng: 'Percent of your day focused on data engineering?',
    // dataprep: 'Percent of your day focused on data prep work?',
    // datasci: 'Percent of your day focused on data science?',
    design: 'Percent of your day focused on design?',
    // dataviz: 'Percent of your day focused on creating/implementing/productizing data visualizations?',
  },
  employment: "What's your employment status",
  vizmoreless: 'Do you want to spend more time or less time visualizing data in the future?',
  vizfrustrations: 'What is your biggest frustration with doing data visualization in your job?',
};
var width = 1000;
var height = 1000;
var barWidth = 700;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {survey: []};
  }

  componentWillMount() {
    d3.csv(process.env.PUBLIC_URL + '/data/survey.csv', survey => {
      survey = _.filter(survey, d => d[surveyQs.employment] === 'Full-time');
      this.setState({survey});
    });
  }

  render() {
    var props = {
      width, height, barWidth,
    };

    // % of time ppl spend doing X, separated by if they want to do more/less viz
    // first divided by more/less, then by the percents
    var graph1Data = _.chain(this.state.survey)
      // // make sure they have answer
      // .filter(d => d[surveyQs.vizfrustrations] && d[surveyQs.vizfrustrations] !== 'Same')
      //  // get either "less" or "more"
      // .groupBy(d => _.last(d[surveyQs.vizmoreless].split(' ')).toLowerCase())
      .groupBy(d => !!d[surveyQs.vizfrustrations])
      .map((answers, type) => {
        return {
          type,
          bars: _.map(surveyQs.percents, (question, type) => {
            var bars = _.chain(answers).filter(a => a[question]).map(a => parseFloat(a[question])).value();
            bars = d3.histogram().domain([0, 100]).thresholds(10)(bars);
            var totals = _.chain(this.state.survey).filter(a => a[question]).map(a => parseFloat(a[question])).value();
            totals = d3.histogram().domain([0, 100]).thresholds(10)(totals);
            return {
              type,
              bars,
              totals,
            }
          }),
        }
      }).value();

    return (
      <div className="App">
        <Bars {...props} data={graph1Data} />
      </div>
    );
  }
}

export default App;
