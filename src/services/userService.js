import RequestService from "./requestService";
import storage from "../utils/Storage";
import Constants from "../common/constants";
import AuthService from "./authService";
import SteemService from "./steemService";
import {blockchainErrorsList} from "../utils/blockchainErrorsList";
import LoggingService from "./loggingService";

class UserService {

	static getUsersList(url, offset, limit, currentOptions) {
		const options = {
			offset,
			limit,
			...currentOptions
		};
		return RequestService.get(url, options);
	}

	static getWaitingTimeForCreate(username) {
		return RequestService.get(`/user/${username}/spam`);
	}

	static getProfile(username) {
		const options = {
			show_nsfw: true,
			show_low_rated: true,
			username: storage.username || undefined
		};
		return RequestService.get(`user/${username}/info`, options);
	}


	static changeFollow(following, status) {
		let blog = ['blog'];
		if (status) blog = [];

		const jsonData = JSON.stringify(
			[Constants.OPERATIONS.FOLLOW, {
				follower: AuthService.getUsername(),
				following: following,
				what: blog
			}]
		);

		return SteemService.changeFollowInBlockchain(jsonData)
			.then(response => {
				LoggingService.logFollow(status, following);
				return Promise.resolve(response);
			})
			.catch(error => {
				let checkedError = blockchainErrorsList(error);
				LoggingService.logFollow(status, following, checkedError);
				return Promise.reject(checkedError);
			})
	}
}

export default UserService;