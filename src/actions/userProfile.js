import {push} from "react-router-redux";
import {getStore} from "../store/configureStore";
import {pushMessage} from "./pushMessage";
import UserService from "../services/userService";

export function getUserProfile(userName) {
	return dispatch => {
		dispatch({
			type: "GET_USER_PROFILE_REQUEST"
		});
		UserService.getProfile(userName).then((result) => {
			dispatch({
				type: 'GET_USER_PROFILE_SUCCESS',
				profile: result
			});
		}).catch(error => {
			dispatch({
				type: 'GET_USER_PROFILE_ERROR',
				error
			});
			dispatch(push('/search/' + userName));
		});
	}
}

export function changeFollow() {
	const state = getStore().getState();
	const followed = state.userProfile.profile['has_followed'];
	const followingName = state.userProfile.profile.username;
	return dispatch => {
		dispatch({
			type: 'CHANGE_FOLLOW_REQUEST'
		});
		UserService.changeFollow(followingName, followed)
			.then(response => {
				dispatch(pushMessage(`User has been successfully ${followed ? 'un' : ''}followed`));
				dispatch({
					type: 'CHANGE_FOLLOW_SUCCESS',
					response
				})
			})
			.catch(error => {
				dispatch(pushMessage(error));
				dispatch({
					type: 'CHANGE_FOLLOW_ERROR',
					error
				})
			})
	}
}