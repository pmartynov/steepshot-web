import React from 'react';
import PropTypes from 'prop-types';
import Utils from '../../utils/Utils';
import './switcher.css';

const Switcher = ({onClick, leftLabel = '', rightLabel = '', left, leftColor, rightColor}) => (
	<div className="container_switcher">
		<label>{leftLabel}</label>
		<div className="input-container_switcher" onClick={onClick}
		     style={{
			     marginLeft: Utils.isNotEmptyString(leftLabel) ? '20px' : 0,
			     marginRight: Utils.isNotEmptyString(rightLabel) ? '20px' : 0
		     }}>
			<div className={left ? 'left_switcher' : 'right_switcher'}
			     style={{
				     backgroundColor: left ? leftColor : rightColor
			     }}/>
		</div>
		<label>{rightLabel}</label>
	</div>
);

Switcher.propTypes = {
	onClick: PropTypes.func.isRequired,
	leftLabel: PropTypes.string,
	rightLabel: PropTypes.string,
	left: PropTypes.bool.isRequired,
	leftColor: PropTypes.string,
	rightColor: PropTypes.string
};

export default Switcher;