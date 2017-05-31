import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {survey: []};
  }

  componentWillMount() {
    d3.csv(process.env.PUBLIC_URL + '/data/survey.csv', survey => {
    });
  }

  render() {


    return (
      <div className="App">
      </div>
    );
  }
}

export default App;
