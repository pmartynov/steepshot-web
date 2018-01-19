import React from 'react';
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import {toggleFlag} from '../../actions/flag';

class FlagComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  updateFlag(e) {
    e.preventDefault();
    this.props.toggleFlag(this.props.postIndex);
  }

  render() {
    let buttonClasses = "btn-flag";
    if (this.props.options[this.props.postIndex].state) {
      buttonClasses = buttonClasses + " marked";
    }
    if (this.props.options[this.props.postIndex].isFlagLoading) {
      buttonClasses = buttonClasses + " loading";
    }

    return (
        <div className="wrap-btn" onClick={this.updateFlag.bind(this)}>
          <button type="button" className={buttonClasses}/>
        </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    options: state.flags.flags,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleFlag: (postIndex) => {
      dispatch(toggleFlag(postIndex));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(FlagComponent);
