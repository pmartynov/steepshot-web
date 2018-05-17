import {getStore} from "../store/configureStore";
import {pushMessage} from "./pushMessage";
import UserService from "../services/userService";


function toggleFollowRequest(author) {
	return {
		type: 'TOGGLE_FOLLOW_REQUEST',
		author,
	};
}

function toggleFollowSuccess(author, response) {
	return {
		type: 'TOGGLE_FOLLOW_SUCCESS',
		author,
		response
	};
}

function toggleFollowError(author, error) {
	return {
		type: 'TOGGLE_FOLLOW_ERROR',
		author,
		error
	};
}

export function toggleFollow(author) {
	const state = getStore().getState();
	const followed = state.users[author]['has_followed'];
	const followingName = state.users[author].username;
	return dispatch => {
		dispatch(toggleFollowRequest(author));
		UserService.changeFollow(followingName, followed)
			.then(response => {
				dispatch(pushMessage(`User has been successfully ${followed ? 'un' : ''}followed`));
				dispatch(toggleFollowSuccess(author, response));
			})
			.catch(error => {
				dispatch(pushMessage(error));
				dispatch(toggleFollowError(author, error));
			})
	};
}
