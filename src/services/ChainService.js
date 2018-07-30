import GolosService from './GolosService';

class ChainService {
	static currentService = null;

	static init(service) {
		ChainService.currentService = service;
		ChainService.currentService.init();
	}

	static setService(service) {
		ChainService.currentService = service;
	}

	static addCommentToBlockchain(commentOperation) {
		return ChainService.currentService.addCommentToBlockchain(commentOperation);
	}

	static changeVoteInBlockchain(postAuthor, permlink, power) {
		return ChainService.currentService.changeVoteInBlockchain(postAuthor, permlink, power);
	}

	static deletePostFromBlockchain(permlink) {
		return ChainService.currentService.deletePostFromBlockchain(permlink);
	}

	static changeFollowInBlockchain(jsonData) {
		return ChainService.currentService.changeFollowInBlockchain(jsonData);
	}

	static sendTransferTroughBlockchain(transferInfo) {
		return ChainService.currentService.sendTransferTroughBlockchain(transferInfo);
	}

	static addPostDataToBlockchain(operations) {
		return ChainService.currentService.addPostDataToBlockchain(operations);
	}

	static getAccounts(username) {
		return ChainService.currentService.getAccounts(username);
	}

	static wifIsValid(postingKey, pubWif) {
		return ChainService.currentService.wifIsValid(postingKey, pubWif);
	}

	static getValidTransaction() {
		return ChainService.currentService.getValidTransaction();
	}

	static getBeneficiaries(permlink, beneficiaries) {
		return ChainService.currentService.getBeneficiaries(permlink, beneficiaries);
	}

	static getTransactionHistory(username, from = -1, limit = 10000) {
		return ChainService.currentService.getTransactionHistory(username, from, limit)
	}

	static powerUp(activeKey, amount) {
		return ChainService.currentService.powerUp(activeKey, amount)
	}

	static powerDown(activeKey, amount) {
		return ChainService.currentService.powerDown(activeKey, amount)
	}

	static usingGolos() {
		return ChainService.currentService instanceof GolosService
	}
}

export default ChainService;