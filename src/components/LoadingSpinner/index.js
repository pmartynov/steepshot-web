import React, { Component } from 'react';

class LoadingSpinner extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      this.props.show ?
        <div className="loader-blocker">
          <div className="testLoader1"/>
          <div className="testLoader2"/>
        </div>
        :
        null
    )
  }

}

LoadingSpinner.defaultProps  = {
  show: true
};

export default LoadingSpinner;
