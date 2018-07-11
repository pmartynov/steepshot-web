import {getStore} from "../store/configureStore";
import {actionLock, actionUnlock} from "./session";
import TransferService from "../services/transferService";
import Constants from "../common/constants";
import {pushErrorMessage, pushMessage} from "./pushMessage";
import {closeModal} from "./modal";
import {hideBodyLoader, showBodyLoader} from "./bodyLoader";
import storage from "../utils/Storage";

export function setToken(token) {
	return {
		type: 'TRANSFER_SET_TOKEN',
		token
	}
}

export function showMemo() {
	return {
		type: 'TRANSFER_SHOW_MEMO'
	}
}

export function changeUsername(value) {
	const validCharacters = /^[-a-zA-Z0-9.]*$/;
	if (validCharacters.test(value)) {
		return {
			type: 'TRANSFER_CHANGE_USERNAME',
			value
		}
	} else {
		return {
			type: 'TRANSFER_ERROR',
			message: 'Incorrect username.'
		}
	}
}

export function changeAmount(value) {
	const validCharacters = /^[0-9.]*$/;
	if (validCharacters.test(value)) {
		return {
			type: 'TRANSFER_CHANGE_AMOUNT',
			value
		}
	} else {
		return {
			type: 'TRANSFER_ERROR',
			message: 'Incorrect amount.'
		}
	}
}

export function changeMemo(value) {
	return {
		type: 'TRANSFER_CHANGE_MEMO',
		value
	}
}

export function changeActiveKey(value) {
	return {
		type: 'TRANSFER_CHANGE_ACTIVE_KEY',
		value
	}
}

export function changeSaveKey() {
	return {
		type: 'TRANSFER_CHANGE_SAVE_KEY'
	}
}

export function clearTransfer() {
	return {
		type: 'TRANSFER_CLEAR'
	}
}

export function transfer() {
	let state = getStore().getState();
	return dispatch => {
		if (state.session.actionLocked) {
			return;
		}
		const transfer = state.transfer;
		if (transfer.saveKey) {
			storage.transferActiveKey = transfer.activeKey;
		} else {
			storage.transferActiveKey = null;
		}
		dispatch(actionLock());
		dispatch(showBodyLoader());
		TransferService.transfer(transfer.activeKey, transfer.amount, transfer.token, transfer.to, transfer.memo)
			.then(() => {
				dispatch(actionUnlock());
				dispatch(hideBodyLoader());
				dispatch(pushMessage(Constants.TRANSFER.BID_TO_BOT_SUCCESS));
				dispatch(closeModal("transfer"));
			})
			.catch(error => {
				dispatch(actionUnlock());
				dispatch(hideBodyLoader());
				if (!error.data && (error.actual === 128 || error.message === Constants.NON_BASE58_CHARACTER)) {
					return dispatch(pushErrorMessage(Constants.TRANSFER.INVALID_ACTIVE_KEY));
				}
				dispatch(pushErrorMessage(error.data ? error : error.message));
			});
	}
}