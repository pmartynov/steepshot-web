import {push} from 'react-router-redux';
import {pushMessage} from "./pushMessage";
import {hideBodyLoader, showBodyLoader} from "./bodyLoader";
import {checkSubscribeAndUpdateSettings, removeSettings} from "./settings";
import storage from "../utils/Storage";
import {unsubscribe} from "./oneSignal";
import UserService from "../services/userService";
import OneSignalService from "../services/oneSignalService";
import LoggingService from "../services/loggingService";
import SteemService from "../services/steemService";

function showMessage(message) {
	return dispatch => {
		dispatch(pushMessage(message));
		dispatch(hideBodyLoader());
	}
}

function loginError(error) {
	return dispatch => {
		dispatch(showMessage(error));
		dispatch({
			type: 'LOGIN_ERROR',
			error
		})
	}
}

export function login(username, postingKey) {
	return dispatch => {
		dispatch(showBodyLoader());
		SteemService.getAccounts(username)
			.then(response => {
				if (response.length === 0) {
					return dispatch(loginError('Such user doesn\'t exist'));
				}
				let pubWif = response[0].posting.key_auths[0][0];
				let isValid = SteemService.wifIsValid(postingKey, pubWif);
				if (!isValid) {
					return dispatch(loginError('Invalid username or posting key'));
				}

				LoggingService.logLogin();
				let avatar = getAvatar(response[0]);
				storage.user = username;
				storage.postingKey = postingKey;
				storage.like_power = 100;
				storage.avatar = avatar;
				OneSignalService.addNotificationTags(username);
				dispatch(checkSubscribeAndUpdateSettings());
				dispatch({
					type: 'LOGIN_SUCCESS',
					postingKey,
					user: username,
					avatar,
					like_power: 100
				});
				dispatch({
					type: 'UPDATE_VOTING_POWER',
					voting_power: response[0].voting_power / 100
				});
				dispatch(push('/feed'));
				let parseResult = JSON.parse(response[0].json_metadata);
				dispatch(showMessage('Welcome to Steepshot, ' + (parseResult.profile.name || username) + '!'));
			})
			.catch(() => {
				return dispatch(loginError('Something went wrong, please, try again later'));
			})
	}
}

function getAvatar(profileData) {
	let avatar = null;
	try {
		const metadata = JSON.parse(profileData.json_metadata);
		avatar = metadata.profile['profile_image'];
	} catch (e) {
	}
	return avatar;
}

function logoutUser() {
	return {
		type: 'LOGOUT_SUCCESS'
	}
}

export function logout() {
	return (dispatch) => {
		dispatch(removeSettings());
		dispatch(unsubscribe());
		storage.user = null;
		storage.postingKey = null;
		storage.settings = null;
		storage.avatar = null;
		storage.like_power = null;
		OneSignalService.removeNotificationTags();
		dispatch(logoutUser());
		dispatch(push(`/browse`));
	}
}

export function updateVotingPower(username) {
	return (dispatch) => {
		UserService.getProfile(username).then((result) => {
			dispatch({
				type: 'UPDATE_VOTING_POWER',
				voting_power: result.voting_power
			})
		});
	}
}

export function clearVPTimeout(vpTimeout) {
	return (dispatch) => {
		dispatch({
			type: 'VOTING_POWER_TIMEOUT',
			vpTimeout: vpTimeout
		})
	}
}

export function setLikePower(likePower) {
	return (dispatch) => {
		storage.like_power = likePower;
		dispatch({
			type: 'SET_LIKE_POWER',
			like_power: likePower
		})
	}
}

export function setUserAuth() {
	return {
		type: 'SET_USER_AUTH'
	}
}