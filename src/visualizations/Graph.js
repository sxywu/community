import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import Answer from './Answer';

class Graph extends Component {
  render() {
    var style = {
      width: this.props.width,
      textAlign: 'center',
      margin: 20,
    };
    var headerStyle = {
      width: this.props.width * 0.75,
      margin: 'auto',
      fontStyle: 'italic',
      lineHeight: 1.6,
    };
    var {questionMap} = this.props.question;
    var answers = _.map(this.props.question.answers, answer => {
      return (
        <div>
          <h4>{answer[1]}</h4>
          <Answer {...this.props} answer={answer} />
        </div>
      );
    });

    return (
      <div style={style}>
        <h3 style={headerStyle}>{questionMap}</h3>
        {answers}
      </div>
    );
  }
}

export default Graph;
