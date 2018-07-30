import {getStore} from '../store/configureStore';
import {actionLock, actionUnlock} from './session';
import WalletService from '../services/WalletService';
import Constants from '../common/constants';
import {pushMessage} from './pushMessage';
import {closeModal} from './modal';
import {hideBodyLoader, showBodyLoader} from './bodyLoader';
import storage from '../utils/Storage';
import {blockchainErrorsList} from '../utils/blockchainErrorsList';

export function showMemo() {
	return {
		type: 'TRANSFER_SHOW_MEMO'
	}
}

export function changeUsername(value) {
	return dispatch => {
		dispatch({
			type: 'TRANSFER_CHANGE_USERNAME',
			value
		});
		const validCharacters = /^[-a-zA-Z0-9.]*$/;
		if (!validCharacters.test(value)) {
			dispatch(inputError('toError', 'Incorrect username.'));
		}
	}
}

export function changeMemo(value) {
	return {
		type: 'TRANSFER_CHANGE_MEMO',
		value
	}
}

export function inputError(field, message) {
	return {
		type: 'TRANSFER_ERROR',
		[field]: message
	}
}

export function transfer() {
	let state = getStore().getState();
	if (state.session.actionLocked) {
		return {
			type: 'ACTION_LOCKED_TRANSFER'
		}
	}
	return dispatch => {
		const {to, memo} = state.transfer;
		const {amount} = state.wallet;
		const {activeKey, saveKey} = state.activeKey;
		const selectedToken = state.services.tokensNames[state.wallet.selectedToken];
		dispatch(actionLock());
		dispatch(showBodyLoader());
		WalletService.transfer(activeKey || storage.activeKey, amount, selectedToken, to, memo)
			.then(() => {
				dispatch(actionUnlock());
				dispatch(hideBodyLoader());
				dispatch(pushMessage(Constants.TRANSFER.TRANSFER_SUCCESS));
        if (saveKey && !storage.activeKey) storage.activeKey = activeKey;
				dispatch(closeModal("transfer"));
			})
			.catch(error => {
				dispatch(actionUnlock());
				dispatch(hideBodyLoader());
				const {message, field} = getErrorData(error);
				if (field && message) {
					dispatch(inputError(field, message));
				}
				dispatch(pushMessage(message));
			});
	}
}

export function getErrorData(error) {
	let message, field;
	if (error.isCustom) {
		field = error.field;
		message = error.message;
	} else {
		message = blockchainErrorsList(error);
		if (message === Constants.ERROR_MESSAGES.INVALID_ACTIVE_KEY) {
			field = 'activeKeyError';
		}
		if (message === Constants.ERROR_MESSAGES.NOT_ENOUGH_TOKENS) {
			field = 'amountError';
		}
		if (message === Constants.ERROR_MESSAGES.USER_NOT_FOUND) {
			field = 'toError';
		}
	}
	return {message, field}
}