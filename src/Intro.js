import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

class Intro extends Component {

  constructor(props) {
    super(props);
    this.updateHeader = this.updateHeader.bind(this);
  }

  componentDidMount() {
    this.header = d3.select(this.refs.header);
  }

  shouldComponentUpdate(nextProps) {
    if (this.frustrations) return false;

    this.frustrations = _.chain(nextProps.survey)
      .map('frustration')
      .filter(text => text && text.length > 32 && text.length < 52)
      .value();

    this.updateIndex = 0;
    this.updateHeader();
    this.interval = setInterval(this.updateHeader, 2500);

    return true;
  }

  updateHeader() {
    if (this.updateIndex > this.frustrations.length) clearTimeout(this.interval);

    var index = _.random(this.frustrations.length - 1);
    var frustration = this.frustrations[index];

    this.header.text(frustration);

    this.updateIndex += 1;
  }

  render() {
    var style = {
      width: 1000,
      margin: '60px auto',
      textAlign: 'center',
      lineHeight: 2,
    };

    return (
      <div style={style}>
        <span style={{textTransform: 'uppercase'}}>
          What is your biggest frustration doing data visualization?
        </span>
        <h1 ref='header' style={{fontSize: '2.4em', marginTop: 5, fontFamily: 'CatMule Caps'}} />
        <sup>
          BY <a href='http://twitter.com/sxywu' target='_new'>SHIRLEY WU</a>
        </sup>

        <p>
Earlier this year, my friend <a href='http://twitter.com/Elijah_Meeks'>Elijah</a> made a bold claim: that most people in data visualization end up leaving the field, because there's something wrong with the current state of data visualization.  It stirred quite a bit of conversation, and resulted in a <a href='https://medium.com/@Elijah_Meeks/2017-data-visualization-survey-results-40688830b9f2' target='_new'>community survey</a> and a <a href='https://medium.com/visualizing-the-field/visualizing-the-field-finding-our-way-6330d3e48555' target='_new'>Medium publication</a>.  The survey itself had <strong>45 questions</strong>, and ranged from asking for demographic information to the role of data visualization in the respondent's job.  It garnered <strong>981 responses</strong>, and out of curiosity, I decided to dig into their answers.
        </p>

        <p>
Since none of the <a href='https://github.com/emeeks/data_visualization_survey/blob/master/data/questions.txt' target='_new'>survey questions</a> could actually measure whether people are leaving the field, I focused instead on their frustrations.  I wanted to know whether more or less people had frustrations, and how that number correlated with other aspects of their data visualization jobs: if they were hired to do data visualization, were they more likely to have frustrations?  What about if they were paid more or less than their UI and design counterparts, or if they worked collaboratively or consultatively with their consumer?  By looking at the frustrations that come from specific parts of their jobs, I'm hoping to identify the areas that we as a community can work to better.
        </p>
      </div>
    );
  }
}

export default Intro;
