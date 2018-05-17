import {getStore} from "../store/configureStore";

class AuthService {
	static getUsername() {
		return getStore().getState().auth.user
	}

	static getPostingKey() {
		return getStore().getState().auth.postingKey
	}
}

export default AuthService;