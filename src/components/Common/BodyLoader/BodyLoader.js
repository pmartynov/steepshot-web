import React from 'react';
import {connect} from 'react-redux';
import BlockLoader from '../BlockLoader/BlockLoader';

const BodyLoader = ({loading}) => (
	<BlockLoader show={loading}/>
);

const mapStateToProps = (state) => {
	return {
		loading: state.bodyLoader
	}
};

export default connect(mapStateToProps)(BodyLoader);
