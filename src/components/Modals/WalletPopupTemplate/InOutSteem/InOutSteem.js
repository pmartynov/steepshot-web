import React from 'react';
import './inOutSteem.css';
import {connect} from 'react-redux';

const InOutSteem = ({balance, total_steem_power_steem, newSteem, newSteemPower}) => (
  <div className="wrapper_in-out-steem">
    <div className="steem-amount_in-out-steem">
      <span>Steem</span>
      <span className="display--flex">
        <span className="start-balance_in-out-steem">{balance} >&nbsp;</span>
        <span className="short-amount_in-out-steem">{newSteem}</span>
      </span>
    </div>
    <div className="border-line_in-out-steem"/>
    <div className="steem-power-amount_in-out-steem">
      <span>Steem Power</span>
      <span className="display--flex">
        <span className="start-balance_in-out-steem">{total_steem_power_steem} >&nbsp;</span>
        <span className="short-amount_in-out-steem">{newSteemPower}</span>
      </span>
    </div>
  </div>
);

const mapStateToProps = (state, props) => {
  const {amount} = state.wallet;
  const {balance, total_steem_power_steem} = state.userProfile.profile;
  let newSteem, newSteemPower;
  let tokensAmount = +amount;
  if (isNaN(tokensAmount)) {
    tokensAmount = 0;
  }
  if (props.point === 'power-up') {
    newSteem = balance - tokensAmount;
    newSteemPower = total_steem_power_steem + tokensAmount;
  }
  if (props.point === 'power-down') {
    newSteem = balance + tokensAmount ;
    newSteemPower = total_steem_power_steem - tokensAmount;
  }
  return {
    balance,
    total_steem_power_steem,
    newSteem: newSteem.toFixed(3) / 1,
    newSteemPower: newSteemPower.toFixed(3) / 1
  }
};

export default connect(mapStateToProps)(InOutSteem);