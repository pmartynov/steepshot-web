import React from 'react';
import {
  Link
} from 'react-router-dom';
import {
  connect
} from 'react-redux';
import PropTypes from 'prop-types';
import constants from '../../common/constants';
import utils from '../../utils/utils';

class TagComponent extends React.Component {
     constructor(props) {
        super(props);

        this.state = {
        ...this.props
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            ...nextProps
        })
    }

    checkFirst(str) {
        if (str[0] == '#') return str.substring(1);
        return str;
    }

    render() {
        if (this.state.tag == 'steepshot' || this.state.tag == '#steepshot') {
            return null;
        } else 
        return (
            <Link  
                key={this.state.key}
                to={`/search/${this.checkFirst(this.state.tag)}`}
            >
              {utils.tagPrettify(this.state.tag)}
            </Link>
        )
    }
}

TagComponent.propTypes = {
  tag: PropTypes.string.isRequired
};

const mapStateToProps = (state) => {
  return {
    localization: state.localization,
    history : state.history
  };
};

export default connect(mapStateToProps)(TagComponent);
