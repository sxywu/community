import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var surveyQs = {
  percents: {
    dataeng: 'Percent of your day focused on data engineering?',
    dataprep: 'Percent of your day focused on data prep work?',
    datasci: 'Percent of your day focused on data science?',
    design: 'Percent of your day focused on design?',
    dataviz: 'Percent of your day focused on creating/implementing/productizing data visualizations?',
  },
  employment: "What's your employment status",
  vizmoreless: 'Do you want to spend more time or less time visualizing data in the future?',
  vizfrustrations: 'What is your biggest frustration with doing data visualization in your job?',
};

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
    // % of time ppl spend doing X, separated by if they want to do more/less viz
    // first divided by more/less, then by the percents
    var graph1Data = _.chain(this.state.survey)
      // make sure they have answer
      .filter(d => d[surveyQs.vizmoreless] && d[surveyQs.vizmoreless] !== 'Same')
       // get either "less" or "more"
      .groupBy(d => _.last(d[surveyQs.vizmoreless].split(' ')).toLowerCase())
      .map((answers, type) => {
        return {
          type,
          bars: _.map(surveyQs.percents, type => {
            return {
              type,
              bars: _.filter(answers, a => a[type]),
            }
          }),
        }
      }).value();

    return (
      <div className="App">
      </div>
    );
  }
}

export default App;
