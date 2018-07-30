import golos from 'golos-js';
import Constants from '../common/constants';
import PostService from './PostService';
import AuthService from './AuthService';
import steem from 'steem';

class GolosService {

	init() {
		golos.config.set('websocket', Constants.BLOCKCHAIN.golos.CONNECTION_SERVERS[0]);
		golos.config.set('address_prefix', Constants.BLOCKCHAIN.golos.PREFIX);
		golos.config.set('chain_id', Constants.BLOCKCHAIN.golos.CHAIN_ID);
	}

	addCommentToBlockchain(commentOperation) {
		return processResponse(callback => {
			let beneficiaries = this.getBeneficiaries(commentOperation[1].permlink, [{
				account: 'steepshot',
				weight: 1000
			}]);
			const operations = [commentOperation, beneficiaries];
			golos.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()},
				callback
			);
		})
	}

	changeVoteInBlockchain(postAuthor, permlink, power) {
		return processResponse(callback => {
			golos.broadcast.vote(AuthService.getPostingKey(), AuthService.getUsername(), postAuthor, permlink, power, callback);
		})
	}

	deletePostFromBlockchain(permlink) {
		return processResponse(callback => {
			golos.broadcast.deleteComment(AuthService.getPostingKey(), AuthService.getUsername(), permlink, callback);
		})
	}

	changeFollowInBlockchain(jsonData) {
		return processResponse(callback => {
			golos.broadcast.customJson(AuthService.getPostingKey(), [], [AuthService.getUsername()], 'follow', jsonData,
				callback
			);
		})
	}

	sendTransferTroughBlockchain(transferInfo) {
		return processResponse(callback => {
			golos.broadcast.transfer(transferInfo.wif, AuthService.getUsername(), transferInfo.recipient, transferInfo.amount,
				transferInfo.memo, callback);
		})
	}

	addPostDataToBlockchain(operations) {
		return processResponse(callback => {
			golos.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()}, callback
			);
		})
	}

	getAccounts(username) {
		return processResponse(callback => {
			return golos.api.getAccounts([username], callback);
		})
	}

	wifIsValid(postingKey, pubWif) {
		return Promise.resolve(golos.auth.wifIsValid(postingKey, pubWif));
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
		return processResponse(() => {
			return golos.broadcast._prepareTransaction({
				extensions: [],
				operations: [operation],
			})
		})
			.then(transaction => {
				return processResponse(() => {
					return golos.auth.signTransaction(transaction, [AuthService.getPostingKey()])
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
			max_accepted_payout: Constants.SERVICES.golos.MAX_ACCEPTED_PAYOUT,
			percent_steem_dollars: Constants.SERVICES.golos.PERCENT_STEEM_DOLLARS,
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
			golos.api.getAccountHistory(username, from, limit, callback);
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

}

export default GolosService;

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