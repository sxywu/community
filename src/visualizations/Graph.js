import React, { Component } from 'react';
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
      return (<Answer {...this.props} answer={answer} answerKey={value[2]} answerVal={value[1]} />);
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
        <h4 style={headerStyle}>
          <Select className='header' name='form-question'
            value={this.props.question.index} options={questions}
            clearable={false} onChange={this.props.updateQuestion} />
        </h4>
        {answers}
      </div>
    );
  }
}

export default Graph;
