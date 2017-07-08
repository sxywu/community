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
    };

    return (
      <div style={style}>
        <span style={{textTransform: 'uppercase'}}>
          What is your biggest frustration doing data visualization?
        </span>
        <h1 ref='header' style={{marginTop: 5}} />
        <sup>
          BY <a href='http://twitter.com/sxywu' target='_new'>SHIRLEY WU</a>
        </sup>
      </div>
    );
  }
}

export default Intro;
