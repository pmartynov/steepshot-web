import React from 'react';
import {connect} from 'react-redux';
import './transfer.css';
import ChooseToken from '../../Common/ChooseToken/ChooseToken';
import {changeMemo, changeUsername, showMemo, transfer} from '../../../actions/transfer';
import ShowIf from '../../Common/ShowIf';
import {closeModal} from '../../../actions/modal';
import WalletPopupTemplate from '../WalletPopupTemplate/WalletPopupTemplate';
import InputActiveKey from '../../Common/InputActiveKey/InputActiveKey';
import {changeAmount, isValidAmountTokens, setToken} from '../../../actions/wallet';
import {closeContextMenu} from '../../../actions/contextMenu';

class Transfer extends React.Component {

	constructor() {
		super();
		this.changeUsername = this.changeUsername.bind(this);
		this.changeMemo = this.changeMemo.bind(this);
		this.changeAmount = this.changeAmount.bind(this);
		this.sendTransfer = this.sendTransfer.bind(this);
	}

	changeUsername(e) {
		this.props.changeUsername(e.target.value);
	}

	changeAmount(e) {
		this.props.changeAmount(e.target.value);
	}

	changeMemo(e) {
		this.props.changeMemo(e.target.value);
	}

	sendTransfer() {
    this.props.isValidAmountTokens(this.props.amount, this.props.balance, this.props.transfer);
	}

	/*setAmountRef(ref) {
		this.amount = ref;
	}

	amountFocused() {
		this.amount.select();
	}*/

	render() {
		const {username, selectedToken, balance, memoOpened, to, toError, amount, amountError, memo, tokensNames,
			closeChooseTokens, closeTransferModal} = this.props;
		return (
			<WalletPopupTemplate title="TRANSFER"
			                     username={username}
													 notBotUsernameLink={`/@${username}`}
			                     textButton="SEND"
			                     cancel={closeTransferModal}
			                     ok={this.sendTransfer}
													 mainClick={closeChooseTokens}>
				<form className="body_transfer" autoComplete="off">
					<div className="form-line_transfer">
						<p className="label_transfer">
							To
						</p>
						<div className="field_transfer">
							<div className="at_transfer"/>
							<input type='text' placeholder="username" onChange={this.changeUsername} maxLength={30} value={to}
										 autoComplete="off"/>
						</div>
						<label className="recipient-error_transfer">{toError}</label>
					</div>
					<div className="form-line-not-overflow_transfer">
						<ChooseToken selectedItemNumber={selectedToken}
						             tokensAmount={balance}
						             tokensNames={tokensNames}
												 label="Amount"
												 value={amount}
												 error={amountError}/>
					</div>
					<ShowIf show={!memoOpened}>
						<div className="add-memo_transfer">
							<span onClick={this.props.showMemo}>
								+&nbsp;message
							</span>
						</div>
					</ShowIf>
					<ShowIf show={memoOpened}>
						<p className="inputs-label">
							Memo
						</p>
						<textarea onChange={this.changeMemo} placeholder="This memo is public" value={memo}/>
					</ShowIf>
					<InputActiveKey className="active-key_transfer"/>
				</form>
			</WalletPopupTemplate>
		);
	}
}

const mapStateToProps = state => {
	const {to, memo, showMemo, toError} = state.transfer;
	const {amount, amountError, selectedToken, tokenValue} = state.wallet;
	const {tokensNames} = state.services;
	return {
		balance: tokenValue[selectedToken],
		selectedToken,
		tokensNames,
		selectedTokenName: tokensNames[selectedToken],
		username: state.auth.user,
		memoOpened: showMemo,
		to,
		toError,
		amount,
		amountError,
		memo
	}
};

const mapDispatchToProps = dispatch => {
	return {
		setToken: token => {
			dispatch(setToken(token))
		},
		showMemo: () => {
			dispatch(showMemo())
		},
		changeUsername: value => {
			dispatch(changeUsername(value))
		},
		changeAmount: value => {
			dispatch(changeAmount(value))
		},
		changeMemo: value => {
			dispatch(changeMemo(value))
		},
		transfer: () => {
			dispatch(transfer())
		},
		closeTransferModal: () => {
			dispatch(closeModal("transfer"))
		},
    closeChooseTokens: () => {
			dispatch(closeContextMenu("chooseToken"));
		},
    isValidAmountTokens: (tokensAmount, balance, transactionAction) => {
      dispatch(isValidAmountTokens(tokensAmount, balance, transactionAction))
    }
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Transfer);
