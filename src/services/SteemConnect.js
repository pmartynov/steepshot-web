import sc2 from 'sc2-sdk';
import AuthService from './AuthService';
import SteemService from './SteemService';

const location = window.location;
const callbackURL = `${location.origin}/steemConnect`;
const api = sc2.Initialize({
	app: 'dev.steepshot',
	callbackURL,
	scope: ['login', 'offline', 'vote', 'comment', 'delete_comment', 'comment_options', 'custom_json']
});

class SteemConnect {

	static getLoginUrl() {
		return api.getLoginURL()
	}

	init() {
		api.setAccessToken(AuthService.getAccessToken());
	}

	addCommentToBlockchain(commentOperation) {
		let beneficiaries = this.getBeneficiaries(commentOperation[1].permlink, [{
			account: 'steepshot',
			weight: 1000
		}]);
		const operations = [commentOperation, beneficiaries];
		return api.broadcast(operations).then(response => Promise.resolve(response.result));
	}

	changeVoteInBlockchain(postAuthor, permlink, power) {
		return api.vote(AuthService.getUsername(), postAuthor, permlink, power);
	}

	deletePostFromBlockchain(permlink) {
		const params = {
			'author': AuthService.getUsername(),
			'permlink': permlink
		};
		return api.broadcast([['delete_comment', params]])
	}

	changeFollowInBlockchain(jsonData) {
		const params = {
			required_auths: [],
			required_posting_auths: [AuthService.getUsername()],
			id: 'follow',
			json: jsonData
		};
		return api.broadcast([['custom_json', params]]);
	}

	addPostDataToBlockchain(operations) {
    return api.broadcast(operations).then(response => Promise.resolve(response.result));
	}

  sendTransferTroughBlockchain(transferInfo) {
		const transferLink = api.sign('transfer', transferInfo, location.href);
    location.assign(transferLink);
	}

  powerUp(powerUpInfo) {
    const powerUpLink = api.sign('transfer_to_vesting', powerUpInfo, location.href);
    location.assign(powerUpLink);
	}

  powerDown(powerDownInfo) {
    const powerDownLink = api.sign('withdraw_vesting', powerDownInfo, location.href);
    location.assign(powerDownLink);
	}

	getAccounts(username) {
		return new SteemService().getAccounts(username);
	}

	wifIsValid() {
		throw new Error('Only for base authorization.')
	}

	getValidTransaction() {
		throw new Error('Only for base authorization.')
	}

	getBeneficiaries(permlink, beneficiaries) {
		return new SteemService().getBeneficiaries(permlink, beneficiaries);
	}

	getTransactionHistory(username, from, limit) {
		return new SteemService().getTransactionHistory(username, from, limit);
	}
}

export default SteemConnect;