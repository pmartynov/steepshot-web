import steem from 'steem';
import {blockchainErrorsList} from "../utils/blockchainErrorsList";
import Constants from "../common/constants";
import PostService from "./postService";
import AuthService from "./authService";

steem.api.setOptions({url: 'https://api.steemit.com'});

class SteemService {

	static addCommentToBlockchain(commentOperation) {
		return processResponse(callback => {
			let beneficiaries = SteemService.getBeneficiaries(commentOperation[1].permlink, {
				account: 'steepshot',
				weight: 1000
			});
			const operations = [commentOperation, beneficiaries];
			steem.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()},
				callback
			);
		})
	}

	static changeVoteInBlockchain(postAuthor, permlink, power) {
		return processResponse(callback => {
			steem.broadcast.vote(AuthService.getPostingKey(), AuthService.getUsername(), postAuthor, permlink, power, callback);
		})
	}

	static deletePostFromBlockchain(permlink) {
		return processResponse(callback => {
			steem.broadcast.deleteComment(AuthService.getPostingKey(), AuthService.getUsername(), permlink, callback);
		})
	}

	static changeFollowInBlockchain(jsonData) {
		return processResponse(callback => {
			steem.broadcast.customJson(AuthService.getPostingKey(), [], [AuthService.getUsername()], 'follow', jsonData,
				callback
			);
		})
	}

	static addPostDataToBlockchain(operations) {
		return processResponse(callback => {
			steem.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()}, callback
			);
		})
	}

	static getAccounts(username) {
		return processResponse(callback => {
			steem.api.getAccounts([username], callback);
		})
	}

	static wifIsValid(postingKey, pubWif) {
		return steem.auth.wifIsValid(postingKey, pubWif);
	}

	static getValidTransaction() {
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
		return steem.broadcast._prepareTransaction({
			extensions: [],
			operations: [operation],
		}).then(transaction => {
			return steem.auth.signTransaction(transaction, [AuthService.getPostingKey()])
		}).catch(error => {
			let checkedError = blockchainErrorsList(error);
			return Promise.reject(checkedError);
		});
	}

	static getBeneficiaries(permlink, beneficiaries) {
		let beneficiariesObject = {
			author: AuthService.getUsername(),
			permlink: permlink,
			max_accepted_payout: Constants.STEEM_PATLOAD.MAX_ACCEPTED_PAYOUT,
			percent_steem_dollars: Constants.STEEM_PATLOAD.PERCENT_STEMM_DOLLARS,
			allow_votes: true,
			allow_curation_rewards: true,
			extensions: [[0, {beneficiaries: beneficiaries}]]
		};

		return [Constants.OPERATIONS.COMMENT_OPTIONS, beneficiariesObject];
	}
}

export default SteemService;

function processResponse(sendingFunction) {
	return new Promise((resolve, reject) => {
		const callbackBc = (err, success) => {
			let errorMessage = '';
			if (err) {
				errorMessage = blockchainErrorsList(err);
				reject(errorMessage);
			} else if (success) {
				resolve(success);
			}
		};
		sendingFunction(callbackBc);
	})
}