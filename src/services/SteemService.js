import steem from 'steem';
import Constants from '../common/constants';
import PostService from './PostService';
import AuthService from './AuthService';
import SteemNodeService from './SteemNodeService';

let dynamicProps = [];
steem.api.getDynamicGlobalProperties((err, result) => {
	if (result) {
		dynamicProps = result;
	}
});

class SteemService {

	init() {
		SteemNodeService.initConfig();
	}

	addCommentToBlockchain(commentOperation) {
		return processRequest(callback => {
			let beneficiaries = this.getBeneficiaries(commentOperation[1].permlink, [{
				account: 'steepshot',
				weight: 1000
			}]);
			const operations = [commentOperation, beneficiaries];
			steem.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()},
				callback
			);
		})
	}

	changeVoteInBlockchain(postAuthor, permlink, power) {
		return processRequest(callback => {
			steem.broadcast.vote(AuthService.getPostingKey(), AuthService.getUsername(), postAuthor, permlink, power, callback);
		})
	}

	deletePostFromBlockchain(permlink) {
		return processRequest(callback => {
			steem.broadcast.deleteComment(AuthService.getPostingKey(), AuthService.getUsername(), permlink, callback);
		})
	}

	changeFollowInBlockchain(jsonData) {
		return processRequest(callback => {
			steem.broadcast.customJson(AuthService.getPostingKey(), [], [AuthService.getUsername()], 'follow', jsonData,
				callback
			);
		})
	}

	addPostDataToBlockchain(operations) {
		return processRequest(callback => {
			steem.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()},
				callback
			);
		})
	}

	sendTransferTroughBlockchain(transferInfo) {
		return processRequest(callback => {
			steem.broadcast.transfer(transferInfo.wif, AuthService.getUsername(), transferInfo.recipient, transferInfo.amount,
				transferInfo.memo, callback);
		});
	}

	getAccounts(username) {
		return processRequest(callback => {
			steem.api.getAccounts([username], callback);
		})
	}

	wifIsValid(postingKey, pubWif) {
		return Promise.resolve(steem.auth.wifIsValid(postingKey, pubWif));
	}

	getValidTransaction() {
		const operation = [Constants.OPERATIONS.COMMENT, {
			parent_author: '',
			parent_permlink: '',
			author: AuthService.getUsername(),
			permlink: PostService.createPostPermlink('steepshot'),
			title: 'steepshot',
			description: '',
			body: 'steepshot',
			json_metadata: {
				tags: ['steepshot'],
				app: 'steepshot'
			}
		}];
		return processRequest(() => {
			return steem.broadcast._prepareTransaction({
				extensions: [],
				operations: [operation],
			})
		})
			.then(transaction => {
				return processRequest(() => {
					return steem.auth.signTransaction(transaction, [AuthService.getPostingKey()])
				})
			})
			.catch(error => {
				return Promise.reject(error);
			});
	}

	getBeneficiaries(permlink, beneficiaries) {
		let beneficiariesObject = {
			author: AuthService.getUsername(),
			permlink: permlink,
			max_accepted_payout: Constants.SERVICES.steem.MAX_ACCEPTED_PAYOUT,
			percent_steem_dollars: Constants.SERVICES.steem.PERCENT_STEEM_DOLLARS,
			allow_votes: true,
			allow_curation_rewards: true,
			extensions: [[0, {beneficiaries: beneficiaries}]]
		};
		return [Constants.OPERATIONS.COMMENT_OPTIONS, beneficiariesObject];
	}

	getTransactionHistory(username, from, limit) {
		if (from !== -1 && from < limit) {
			limit = from
		}
		return processResponse(callback => {
			steem.api.getAccountHistory(username, from, limit, callback);
		})
	}

	powerUp(activeKey, amount) {
		const username = AuthService.getUsername();
		return processResponse(callback => {
			steem.broadcast.transferToVesting(activeKey, username, username, amount, callback);
		})
	}

	powerDown(activeKey, amount) {
		return processResponse(callback => {
			steem.broadcast.withdrawVesting(activeKey, AuthService.getUsername(), amount, callback);
		})
	}

	static vestsToSp(vesting_shares) {
		const vests = parseFloat(vesting_shares.split(' ')[0]);
		const total_vests = parseFloat(dynamicProps['total_vesting_shares'].split(' ')[0]);
		const total_vest_steem = parseFloat(dynamicProps['total_vesting_fund_steem'].split(' ')[0]);
		return (total_vest_steem * (vests / total_vests)).toFixed(3);
	}

}

export default SteemService;

function processRequest(sendRequestFunction) {
	return new Promise((resolve, reject) => {
		const steemNodeService = new SteemNodeService();
		checkingNode(resolve, reject, sendRequestFunction, steemNodeService);
	});
}

function checkingNode(resolve, reject, sendRequestFunction, steemNodeService) {
	processResponse(callback => {
		return sendRequestFunction(callback)
	})
		.then(response => {
			resolve(response);
		})
		.catch(error => {
			if (steemNodeService.isMaxCountRequests()) {
				reject(error);
			} else {
				steemNodeService.setNextNode();
				checkingNode(resolve, reject, sendRequestFunction, steemNodeService);
			}
		})
}

function processResponse(sendingFunction) {
	return new Promise((resolve, reject) => {
		const callback = (err, success) => {
			if (err) {
				reject(err);
			} else {
				resolve(success);
			}
		};
		const responseBlockchain = sendingFunction(callback);
		if (typeof(responseBlockchain) === 'object') {
			if (typeof(responseBlockchain.then) === 'function') {
				responseBlockchain
					.then(response => {
						if (!response.error) {
							resolve(response);
						} else {
							reject(response.error);
						}
					})
					.catch(error => {
						reject(error);
					})
			} else {
				resolve(responseBlockchain);
			}
		}
	})
}
