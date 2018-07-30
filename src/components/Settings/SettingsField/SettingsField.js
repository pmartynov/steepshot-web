import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import './settingsField.css';
import {initializeSettingsField, toggleSettingsField} from '../../../actions/settingsFields';
import Switcher from '../../Switcher/Switcher';

class SettingsField extends React.Component {

	componentWillMount() {
		this.props.initializeSettingsField(this.props.point, this.props.default);
	};

	render() {
		if (!this.props.initialized) {
			return null;
		}
		const {label, active, point, toggleSettingsField} = this.props;
		return (
			<div className="field_settings">
				<span>{label}</span>
				<Switcher onClick={() => toggleSettingsField(point)} left={!active} rightColor="#ff1e00" leftColor="#d9d9d9"/>
			</div>
		)
	}
}

SettingsField.propTypes = {
	label: PropTypes.string.isRequired,
	point: PropTypes.string.isRequired,
	default: PropTypes.bool
};

SettingsField.defaultProps = {
	default: false
};

const mapStateToProps = (state, props) => {
	return {
		initialized: state.settingsFields[props.point] !== undefined,
		active: state.settingsFields[props.point]
	}
};

const mapDispatchToProps = dispatch => {
	return {
		initializeSettingsField: (point, def) => {
			dispatch(initializeSettingsField(point, def))
		},
		toggleSettingsField: point => {
			dispatch(toggleSettingsField(point))
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsField);
