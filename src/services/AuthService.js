import {getStore} from '../store/configureStore';
import storage from '../utils/Storage';
import StorageService from './StorageService';

class AuthService {
	static getUsername() {
		return getStore().getState().auth.user || storage.username
	}

	static getPostingKey() {
		return getStore().getState().auth.postingKey || storage.postingKey
	}

	static getAccessToken() {
		const expiresIn = storage.expiresIn;
		if (expiresIn && new Date().getTime() > parseInt(expiresIn, 10)) {
			StorageService.clearAuthData();
		}
		return getStore().getState().auth.accessToken || storage.accessToken
	}

	static isAuth() {
		return !!AuthService.getUsername() && (!!AuthService.getPostingKey() || !!AuthService.getAccessToken())
	}

	static isAuthWithToken() {
		return !!AuthService.getAccessToken()
	}
}

export default AuthService;