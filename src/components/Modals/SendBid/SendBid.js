import React from 'react';
import {connect} from 'react-redux';
import './sendBid.css';
import {closeModal} from '../../../actions/modal';
import Constants from '../../../common/constants';
import {
	searchingNewBot,
	sendBid,
	setBlockedTimer,
	setRedTimer
} from '../../../actions/promoteModal';
import WalletPopupTemplate from '../WalletPopupTemplate/WalletPopupTemplate';
import BotTimer from './BotTimer/BotTimer';
import {setActiveKeyInputSecurity} from '../../../actions/activeKey';
import InputActiveKey from '../../Common/InputActiveKey/InputActiveKey';

class SendBid extends React.Component {

	constructor() {
		super();
		this.tick = this.tick.bind(this);
	}

	componentDidMount() {
		this.bidTimer = setTimeout(() => {
			this.props.searchingNewBot();
		}, Constants.SERVICES.BOTS.BOT_UPDATE_TIME * Constants.MILLISECONDS_IN_SECOND);
	}

	componentWillUnmount() {
		this.props.setRedTimer(false);
		this.props.setBlockedTimer(false);
		clearTimeout(this.bidTimer);
		clearTimeout(this.updatableBidTimer);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.blockedTimer && !nextProps.blockedTimer) {
			this.updatableBidTimer = setTimeout(() => {
				this.props.searchingNewBot();
			}, Constants.SERVICES.BOTS.BOT_UPDATE_TIME * Constants.MILLISECONDS_IN_SECOND);
		}
	}

	tick(time) {
		let leftTime = time.toFixed(0) / 1;
		if (leftTime === Constants.PROMOTE.RED_TIMER) {
			this.props.setRedTimer(true);
		}
		if (leftTime === Constants.PROMOTE.BLOCKED_TIMER) {
			this.props.setBlockedTimer(true);
		}
	}

	render() {
		let botAvatarStyle = {backgroundImage: 'url(' + this.props.botAvatar + ')'};
		return (
			<WalletPopupTemplate title="PROMOTER FOUND!"
			                     username={this.props.botName}
			                     usernameLink={`https://steemit.com/@${this.props.botName}`}
			                     textButton='SEND BID'
			                     cancel={this.props.closeModal}
			                     ok={this.props.sendBid}>
				<div className="body_send-bid">
					<div className="bot-logo_send-bid" style={botAvatarStyle}/>
					<BotTimer isRead={this.props.redTimer} isBlocked={this.props.blockedTimer}
					          upvoteTime={this.props.upvoteTime} tick={this.tick}/>
				</div>
				<InputActiveKey className="active-key_transfer"/>
			</WalletPopupTemplate>
		);
	}
}

const mapStateToProps = (state) => {
	const {activeKey, redTimer, blockedTimer, suitableBot} = state.promoteModal;
	return {
		activeKey,
		redTimer,
		blockedTimer,
		upvoteTime: suitableBot.next,
		botName: suitableBot.name,
		botAvatar: suitableBot.avatar
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		closeModal: () => {
			dispatch(closeModal("SendBid"));
		},
		sendBid: () => {
			dispatch(sendBid());
		},
		searchingNewBot: () => {
			dispatch(searchingNewBot());
		},
		setRedTimer: (param) => {
			dispatch(setRedTimer(param));
		},
		setBlockedTimer: (param) => {
			dispatch(setBlockedTimer(param));
		},
		setActiveKeyInputSecurity: (state) => {
			dispatch(setActiveKeyInputSecurity(state));
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(SendBid);
