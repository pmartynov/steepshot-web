import * as React from 'react';
import {connect} from 'react-redux';
import './sendBidModal.css';
import {closeModal} from '../../../../actions/modal';
import Timer from '../../../Common/Timer/Timer';
import Constants from '../../../../common/constants';
import {pushMessage} from '../../../../actions/pushMessage';
import {sendBid, setActiveKeyError, setTimerState} from '../../../../actions/promoteModal';
import {loadingEllipsis} from '../../../../utils/loadingEllipsis';

class SendBidModal extends React.Component {

  componentWillUnmount() {
    this.props.setTimerState('');
  }

  sendBid() {
    if (!this.input.value) {
      this.props.setActiveKeyError(Constants.PROMOTE.EMPTY_KEY_INPUT);
      return;
    }
    let key = this.input.value.replace(/\s+/g, '');
    this.props.sendBid(this.props.steemLink, key, this.props.botName);
  }

  setActiveKeyValue() {
    if (this.props.activeKeyError) {
      this.props.setActiveKeyError('');
    }
  }

  tick(time) {
    let leftTime = +time.toFixed(0);
    if (leftTime === Constants.PROMOTE.RED_TIMER || leftTime === Constants.PROMOTE.BLOCKED_TIMER) {
      this.props.setTimerState(leftTime);
    }
  }

  render() {
    let redTimer = '', blockedTimer = '';
    let sendBid = 'SEND BID';
    if (this.props.sendingBid) {
      sendBid = loadingEllipsis('SENDING');
    }
    if (this.props.redTimer) {
      redTimer = ' red-timer_send-bid-mod';
    }
    let timerBlock = <div className="timer-wrapper_send-bid-mod">
                       <div className="label_send-bid-mod">Expected upvote time</div>
                       <div className={'timer_send-bid-mod' + redTimer}>
                         <Timer waitingTime={100}
                                staticTimer={true}
                                onTimeout={() => {}}
                                onTick={this.tick.bind(this)}/>
                       </div>
                     </div>;
    if (this.props.blockedTimer) {
      blockedTimer = ' blocked-timer_send-bid-mod';
      timerBlock = <div className="timer-wrapper_send-bid-mod">
                     <div className="load-instead-timer_send-bid-mod">{loadingEllipsis('Looking for a new bot')}</div>
                   </div>
    }
    return (
      <div className="wrapper_promote-mod">
        <p className="title_send-bid-mod">
          <span>PROMOTER FOUND!</span>
          <a href={`https://steemit.com/@${this.props.botName}`} target="_blank">@{this.props.botName.toUpperCase()}</a>
        </p>
        <div className="body_send-bid-mod">
          <div className="bot-logo_send-bid-mod"/>
          {timerBlock}
        </div>
        <div className="position--relative">
          <input type="password"
                 placeholder={this.props.littleScreen ? 'Private active key' : 'Put hear your private active key'}
                 className="input_promote-mod"
                 ref={ref => this.input = ref}
                 onChange={this.setActiveKeyValue.bind(this)}/>
          <div className="error_promote-mod">{this.props.activeKeyError}</div>
        </div>
        <div className="buttons_promote-mod">
          <button className="btn btn-index" onClick={() => this.props.closeModal()}>CANCEL</button>
          <button className={'btn btn-default' + blockedTimer}
                  onClick={this.sendBid.bind(this)}>{sendBid}
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const promoteModal = state.promoteModal;
  const botName = 'sneaky-ninja';
  let redTimer = false, blockedTimer = false;
  let littleScreen = state.window.width <= 400;
  if (promoteModal.leftTime) {
    redTimer = promoteModal.leftTime <= Constants.PROMOTE.RED_TIMER;
    blockedTimer = promoteModal.leftTime <= Constants.PROMOTE.BLOCKED_TIMER;
  }
  return {
    ...state.promoteModal,
    botName,
    littleScreen,
    redTimer,
    blockedTimer,
    steemLink: props.steemLink
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: () => {
      dispatch(closeModal("SendBidModal"));
    },
    pushMessage: (message) => {
      dispatch(pushMessage(message));
    },
    setTimerState: (leftTime) => {
      dispatch(setTimerState(leftTime));
    },
    setActiveKeyError: (error) => {
      dispatch(setActiveKeyError(error));
    },
    sendBid: (steemLink, wif, botName) => {
      dispatch(sendBid(steemLink, wif, botName));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SendBidModal);
