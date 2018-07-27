import React from 'react';
import {connect} from 'react-redux';
import './promote.css';
import {closeModal} from '../../../actions/modal';
import {
  addPostIndex, clearPromoteModalInfo, searchingBotRequest, setPromoteInputError
} from '../../../actions/promoteModal';
import Constants from '../../../common/constants';
import {loadingEllipsis} from '../../../utils/loadingEllipsis';
import {pushMessage} from '../../../actions/pushMessage';
import ChooseToken from '../../Common/ChooseToken/ChooseToken';
import ShowIf from '../../Common/ShowIf';
import WalletPopupTemplate from '../WalletPopupTemplate/WalletPopupTemplate';
import {changeAmount, setToken} from '../../../actions/wallet';
import {closeContextMenu} from '../../../actions/contextMenu';

class Promote extends React.Component {

	constructor(props) {
		super(props);
		this.promoteByEnter = this.promoteByEnter.bind(this);
		this.promotePost = this.promotePost.bind(this);
		this.changeAmount = this.changeAmount.bind(this);
	}

	componentDidMount() {
		this.props.changeAmount(0.5);
		this.props.addPostIndex(this.props.index);
		this.container.addEventListener('keypress', this.promoteByEnter);
	}

	componentWillUnmount() {
		this.props.clearPromoteModalInfo();
		this.container.removeEventListener('keypress', this.promoteByEnter);
	}

	changeAmount(e) {
		this.props.changeAmount(e.target.value);
	}

	promoteByEnter(e) {
		if (e.keyCode === 13) {
			e.stopPropagation();
			this.promotePost();
		}
	}

	promotePost() {
		if (!this.props.searchingBot && this.validPromoteInfo()) {
			this.props.searchingBotRequest();
		}
	}

	validPromoteInfo() {
		if (this.props.balance < this.props.amount) {
			this.props.setPromoteInputError(Constants.ERROR_MESSAGES.NOT_ENOUGH_TOKENS);
			return false;
		}
		if (this.props.amount < Constants.SERVICES.BOTS.MIN_BID_VALUE) {
			this.props.setPromoteInputError(Constants.PROMOTE.MIN_AMOUNT_ERROR);
			return false;
		}
		if (this.props.amount > Constants.SERVICES.BOTS.MAX_BID_VALUE) {
			this.props.setPromoteInputError(Constants.PROMOTE.MAX_AMOUNT_ERROR);
			return false;
		}
		let amount = this.props.amount.toString();
		amount = amount.match(/\d+(\.\d+)?/);
		if (amount[0] === amount.input) return true;
		this.props.setPromoteInputError(Constants.PROMOTE.INPUT_ERROR);
		return false;
	}

	render() {
		const {amount, searchingBot, noTokensForPromote, selectedToken, tokensNames, inputError, balance,
			closeModal, closeChooseTokens} = this.props;
		let findText = 'FIND PROMOTER';
		if (searchingBot) {
			findText = loadingEllipsis('LOOKING');
		}
		return (
			<WalletPopupTemplate title="PROMOTE POST"
			                     textButton={noTokensForPromote ? undefined : findText}
			                     cancel={closeModal}
			                     ok={this.promotePost}
													 mainClick={closeChooseTokens}>
				<div className="body_promote" ref={ref => this.container = ref}>
					<ShowIf show={noTokensForPromote}>
						<div className="no-tokens_promote centered--flex">
							There's not enough tokens for promote in your wallet.
						</div>
					</ShowIf>
					<ChooseToken selectedItemNumber={selectedToken}
											 tokensAmount={balance}
											 label={`Promotion amount (minimum ${Constants.SERVICES.BOTS.MIN_BID_VALUE})`}
											 value={amount}
					             tokensNames={tokensNames}
											 error={inputError}/>
				</div>
			</WalletPopupTemplate>
		);
	}
}

const mapStateToProps = (state) => {
	const {tokensNames} = state.services;
	const {amount, selectedToken, tokenValue} = state.wallet;
	const {inputError, searchingBot} = state.promoteModal;
	return {
		inputError,
		noTokensForPromote: tokenValue[0] <= 0.5 && tokenValue[1] <= 0.5,
		searchingBot,
		amount,
		tokensNames,
		selectedToken,
		balance: tokenValue[selectedToken],
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		closeModal: () => {
			dispatch(closeModal("PromoteModal"));
		},
		setToken: token => {
			dispatch(setToken(token))
		},
		changeAmount: value => {
			dispatch(changeAmount(value))
		},
		setPromoteInputError: (error) => {
			dispatch(setPromoteInputError(error));
		},
		pushMessage: (message) => {
			dispatch(pushMessage(message));
		},
		searchingBotRequest: () => {
			dispatch(searchingBotRequest());
		},
		addPostIndex: (postIndex) => {
			dispatch(addPostIndex(postIndex));
		},
		clearPromoteModalInfo: () => {
			dispatch(clearPromoteModalInfo());
		},
    closeChooseTokens: () => {
      dispatch(closeContextMenu("chooseToken"));
    }
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Promote);
