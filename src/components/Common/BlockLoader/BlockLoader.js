import React from 'react';
import ShowIf from '../ShowIf';
import LoadingSpinner from '../../LoadingSpinner';
import PropTypes from 'prop-types';
import './blockLoader.css';

const BlockLoader = ({show, withLoader}) => (
	<ShowIf show={show}>
		<div className="container_block-loader">
			<ShowIf show={withLoader}>
				<LoadingSpinner/>
			</ShowIf>
		</div>
	</ShowIf>
);

BlockLoader.propTypes = {
	show: PropTypes.bool.isRequired,
	withLoader: PropTypes.bool
};

BlockLoader.defaultProps = {
	withLoader: true
};

export default BlockLoader;
