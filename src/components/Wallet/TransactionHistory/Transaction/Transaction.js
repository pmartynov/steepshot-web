import React from 'react';
import './transaction.css';
import TimeAgo from 'timeago-react';
import DateFormatter from '../../../../utils/DateFormatter';
import SteemService from '../../../../services/SteemService';
import AuthService from '../../../../services/AuthService';
import ShowIf from '../../../Common/ShowIf';
import Utils from '../../../../utils/Utils';
import {Link} from 'react-router-dom';

const Transaction = ({operation, data, date, index, isMobileScreen, isExtraSmall}) => {
	let memo = /^#/.test(data.memo) ? (<div className="encoded-memo_trx">data.memo</div>) : data.memo;
	return (
		<div className={'container_trx' + (index % 2 !== 0 ? '' : ' even_trx ') + (isExtraSmall ? ' extra-small_trx' : '')}>
			<div className="type_trx">
				{getOperationText(operation)}
			</div>
			<ShowIf show={!isExtraSmall}>
				{getOperationBody(operation, data)}
			</ShowIf>
			<ShowIf show={!isMobileScreen} key={1}>
				<div className="memo_trx">
					{memo}
				</div>
			</ShowIf>
			<div className="date_trx" key={2}>
				{getFormattedDate(date)}
			</div>
			<ShowIf show={isExtraSmall}>
				{getOperationBody(operation, data)}
			</ShowIf>
			<ShowIf show={isMobileScreen && Utils.isNotEmptyString(data.memo)} key={3}>
				<div className="memo_trx">
					{memo}
				</div>
			</ShowIf>
		</div>
	)
};

export default Transaction;

function getFormattedDate(date) {
	const localData = new Date(date);
	localData.setHours(localData.getHours() + 3);
	if (new Date().getTime() - localData.getTime() < 24 * 60 * 60 * 1000) {
		return (
			<TimeAgo
				datetime={localData}
				locale='en_US'
			/>
		)
	}
	return DateFormatter.convertISOtoCustom(localData);
}

function getOperationText(operation) {
	switch (operation) {
		case 'transfer':
			return 'Transfer';
		case 'claim_reward_balance':
			return 'Claim rewards';
		case 'withdraw_vesting':
			return 'Power down';
		case 'transfer_to_vesting':
			return 'Power up';
		default:
			return 'Transaction'
	}
}

function getOperationBody(operation, data) {
	switch (operation) {
		case 'transfer':
			const isFrom = data.from === AuthService.getUsername();
			return (
				<div className="info_trx">
					{wrap(data.amount)}&nbsp;{isFrom ? 'to' : 'from'}&nbsp;{wrapUser(isFrom ? data.to : data.from)}
				</div>
			);
		case 'claim_reward_balance':
			const isEmptySteem = /^0\.000/.test(data.reward_steem);
			const isEmptySBD = /^0\.000/.test(data.reward_sbd);
			return (
				<div className="info_trx">
					{wrap(data.reward_steem)}
					{isEmptySteem || isEmptySBD ? '' : (<span>,&nbsp;</span>)}
					{wrap(data.reward_sbd)}
					{isEmptySteem && isEmptySBD ? '' : (<span>&nbsp;and&nbsp;</span>)}
					{wrap(SteemService.vestsToSp(data.reward_vests) + ' STEEM POWER')}
				</div>
			);
		case 'withdraw_vesting':
			const isEmptySteemPowerDown =  /^0\.000/.test(data.vesting_shares);
			const steemAmountPowerDown = <span>Start power down of&nbsp;
				{wrap(SteemService.vestsToSp(data.vesting_shares) + ' STEEM', false)}</span>;
			return (
				<div className="info_trx">
					{isEmptySteemPowerDown ? 'Cancel power down' : steemAmountPowerDown}
				</div>
			);
		case 'transfer_to_vesting':
			return (
				<div className="info_trx">
          Transfer&nbsp;{wrap(data.amount)}&nbsp;into&nbsp;{wrap(data.amount + ' POWER')}
				</div>
			);
		default:
			return 'Transaction'
	}
}

function wrap(data, empty = true) {
	if (/^0\.000/.test(data) && empty) return '';
	return (<span style={{color: '#0f181e'}}>{data}</span>);
}

function wrapUser(data) {
  return (<span className="span-user-wrap_trx">
						<Link to={`/@${data}`}>{data}</Link>
					</span>);
}