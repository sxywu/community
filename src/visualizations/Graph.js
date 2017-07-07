import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

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
      padding: '0 40px',
    };
    var answers = _.map(this.props.question.answers, (value, answer) => {
      return (
        <div>
          <h4 style={{margin: 0, marginTop: 20, marginBottom: 10}}>{value[1]}</h4>
          <Answer {...this.props} answer={answer} answerKey={value[2]} />
        </div>
      );
    });

    var index = this.props.index;
    var questions = _.chain(this.props.metadata.questions)
      // don't want the other question that's selected
      .filter(question => this.props.questions[index ? 0 : 1] !== question)
      .map(question => {
        return {
          value: question.index,
          label: (question.index + 1) + '.  ' + question.questionMap,
          index, question};
      }).value();

    return (
      <div style={style}>
        <div style={headerStyle}>
          <Select className='header' name='form-question'
            value={this.props.question.index} options={questions}
            clearable={false} onChange={this.props.updateQuestion} />
        </div>
        {answers}
      </div>
    );
  }
}

export default Graph;
