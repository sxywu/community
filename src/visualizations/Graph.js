import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import Answer from './Answer';

class Graph extends Component {
  render() {
    var style = {
      width: this.props.width,
      textAlign: 'center',
      display: 'inline-block',
      verticalAlign: 'top',
    };
    var headerStyle = {
      width: this.props.width * 0.75,
      margin: 'auto',
      fontStyle: 'italic',
      lineHeight: 1.6,
    };
    var {questionMap} = this.props.question;
    var answers = _.map(this.props.question.answers, (value, answer) => {
      return (
        <div>
          <h4 style={{margin: 0, marginTop: 20}}>{value[1]}</h4>
          <Answer {...this.props} answer={answer} answerKey={value[2]} />
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
