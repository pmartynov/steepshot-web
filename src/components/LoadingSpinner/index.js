import React, { Component } from 'react';

class LoadingSpinner extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      this.props.show ?
        <div className="loader-blocker">
          {/*<div className="loader" />*/}
          <div className="newLoaderOuter"/>
          <div className="newLoaderInner"/>
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
