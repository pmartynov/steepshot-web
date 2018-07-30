import RequestService from './RequestService';
import Constants from '../common/constants';
import AuthService from './AuthService';
import LoggingService from './LoggingService';
import ChainService from './ChainService';

class UserService {

	static getUsersList(url, offset, limit, currentOptions) {
		const options = {
			offset,
			limit,
			username: AuthService.getUsername(),
			...currentOptions
		};
		return RequestService.get(url, options);
	}

	static getWaitingTimeForCreate(username) {
		return RequestService.get(`user/${username}/spam`);
	}

	static getProfile(username, show_nsfw, show_low_rated) {
		const options = {
			show_nsfw,
			show_low_rated,
			username: AuthService.getUsername()
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

		return ChainService.changeFollowInBlockchain(jsonData)
			.then(response => {
				LoggingService.logFollow(status, following);
				return Promise.resolve(response);
			})
			.catch(error => {
				LoggingService.logFollow(status, following, error);
				return Promise.reject(error);
			})
	}
}

export default UserService;