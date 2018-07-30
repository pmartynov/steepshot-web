import {push} from 'react-router-redux';
import {hideBodyLoader, showBodyLoader} from './bodyLoader';
import LoggingService from '../services/LoggingService';
import ChainService from '../services/ChainService';
import {getAvatar, initOneSignalService, showMessage} from './auth';
import {pushErrorMessage} from './pushMessage';
import StorageService from '../services/StorageService';
import {setService} from './services';

export function setUsernameErrorMessage(message = '') {
	return {
		type: 'SET_USERNAME_ERROR_MESSAGE',
		message
	}
}

export function setPostingKeyErrorMessage(message = '') {
	return {
		type: 'SET_POSTING_KEY_ERROR_MESSAGE',
		message
	}
}

export function clearLoginErrors() {
	return {
		type: 'CLEAR_LOGIN_ERROR'
	}
}

export function loginWithSteemConnect(params) {
	const username = params.username;
	const expiresIn = params['expires_in'] * 1000 + new Date().getTime();
	const accessToken = params['access_token'];
	return dispatch => {
		dispatch(showBodyLoader());
		if (!username || !expiresIn || !accessToken) {
			dispatch(push('/login'));
			return {
				type: 'LOGIN_WITH_STEEM_CONNECT_ERROR',
				params
			};
		}
		dispatch({
			type: 'LOGIN_WITH_STEEM_CONNECT_REQUEST',
			params
		});
		ChainService.getAccounts(username)
			.then(response => {
				const service = '';
				let avatar = getAvatar(response[0]);
				StorageService.setSteemConnectData(username, expiresIn, accessToken, avatar, service);
				initOneSignalService(username, dispatch);
				dispatch({
					type: 'LOGIN_WITH_STEEM_CONNECT_SUCCESS',
					user: username,
					accessToken,
					avatar,
					like_power: 100,
					voting_power: response[0].voting_power / 100
				});
				dispatch(setService());
				dispatch(push('/feed'));
				dispatch(showMessage('Welcome to Steepshot, ' + username + '!'));
				LoggingService.logLogin();
			})
			.catch(error => {
				StorageService.clearAuthData();
				dispatch(loginError(error));
			})
	}
}

function loginError(error) {
	return dispatch => {
		dispatch(pushErrorMessage(error));
		dispatch({
			type: 'LOGIN_WITH_STEEM_CONNECT_ERROR',
			error
		});
		dispatch(hideBodyLoader());
	}
}