import ChainService from "./ChainService";
import Utils from "../utils/Utils";

class WalletService {

	static transfer(activeKey, amount, token, to, memo) {
		return checkActiveKey(activeKey)
			.then(() => checkAmount(amount))
			.then(() => checkRecipient(to))
			.then(() => {
				let transferInfo = {
					wif: activeKey,
					recipient: to,
					amount: getValidAmountFormat(amount, token),
					memo: memo
				};
				return ChainService.sendTransferTroughBlockchain(transferInfo);
			})
	}

	static powerUp(activeKey, amount) {
		return checkActiveKey(activeKey)
			.then(() => checkAmount(amount))
			.then(() => {
				const token = ChainService.usingGolos() ? 'GOLOS' : 'STEEM';
				return ChainService.powerUp(activeKey, getValidAmountFormat(amount, token));
			});
	}

}

function checkActiveKey(activeKey) {
	const error = new Error();
	error.isCustom = true;
	if (Utils.isEmptyString(activeKey)) {
		error.message = 'Active key can\'t be empty.';
		error.field = 'activeKeyError';
		return Promise.reject(error)
	}
	return Promise.resolve();
}

function checkAmount(amount) {
	const error = new Error();
	error.isCustom = true;
	if (Utils.isEmpty(amount)) {
		error.message = 'Amount can\'t be empty.';
		error.field = 'amountError';
		return Promise.reject(error)
	}
	if (amount < 0.001) {
		error.message = 'Amount can\'t be less then 0.001.';
		error.field = 'amountError';
		return Promise.reject(error)
	}
	return Promise.resolve();
}

function checkRecipient(recipient) {
	const error = new Error();
	error.isCustom = true;
	if (Utils.isEmptyString(recipient)) {
		error.message = 'Recipient can\'t be empty.';
		error.field = 'toError';
		return Promise.reject(error)
	}
	return Promise.resolve();
}

function getValidAmountFormat(amount, token) {
	let validAmount = amount.toString();
	if (/\./.test(validAmount)) {
		validAmount = validAmount + '000';
	} else {
		validAmount = validAmount + '.000';
	}
	return validAmount.replace(/(\d+\.\d{3})(\d*)/, '$1') + ' ' + token;
}

export default WalletService;