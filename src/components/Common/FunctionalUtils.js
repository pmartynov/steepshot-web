import React from 'react';
import {connect} from 'react-redux';
import {updateVotingPower} from '../../actions/auth';
import PushMessage from './PushMessage/PushMessage';
import PushNotifications from '../PushNotifications/PushNotifications';
import Clipboard from './Clipboard/Clipboard';
import Modals from '../Modals/Modals';
import {resizeWindow} from '../../actions/utils';
import MobileNavigation from '../MobileNavigation/MobileNavigation';
import {loadSubscribeData} from '../../actions/oneSignal';
import {setService} from '../../actions/services';
import BodyLoader from './BodyLoader/BodyLoader';

class FunctionalUtils extends React.Component {

	constructor(props) {
		super();
		props.setService();
		if (!global.isServerSide) {
			props.loadSubscribeData();
		}
	}

	componentDidMount() {
		window.addEventListener('resize', this.props.resizeWindow);
		this.updateVotingPower();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.resizeWindow);
	}

	updateVotingPower() {
		if (this.props.user) {
			this.props.updateVotingPower(this.props.user);
		}
	}

	render() {
		return (
			<div className="utils-container" key="FunctionalUtils">
				<PushNotifications/>
				<PushMessage/>
				<Clipboard/>
				<Modals/>
				<MobileNavigation/>
				<BodyLoader />
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.auth.user
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		updateVotingPower: (username) => {
			dispatch(updateVotingPower(username));
		},
		resizeWindow: () => {
			dispatch(resizeWindow())
		},
		loadSubscribeData: () => {
			dispatch(loadSubscribeData())
		},
		setService: () => {
			dispatch(setService())
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(FunctionalUtils);