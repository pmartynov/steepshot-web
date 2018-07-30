import {getStore} from '../store/configureStore';
import Constants from '../common/constants';
import {updatePost} from './post';
import {updateVotingPower} from './auth';
import {pushErrorMessage, pushMessage} from './pushMessage';
import {actionLock, actionUnlock} from './session';
import PostService from '../services/PostService';
import AuthService from '../services/AuthService';

function toggleFlagRequest(postIndex) {
	return {
		type: 'TOGGLE_FLAG_REQUEST',
		index: postIndex,
	};
}

function toggleFlagSuccess(postIndex, response) {
	return {
		type: 'TOGGLE_FLAG_SUCCESS',
		index: postIndex,
		response
	};
}

function toggleFlagError(postIndex, error) {
	return {
		type: 'TOGGLE_FLAG_ERROR',
		index: postIndex,
		error
	};
}

export function toggleFlag(postIndex) {
	return function (dispatch) {
		let state = getStore().getState();
		let username = state.auth.user;
		let post = state.posts[postIndex];
		const newFlagState = !post.flag;
		if (!AuthService.isAuth()) {
			dispatch(pushMessage(Constants.VOTE_ACTION_WHEN_NOT_AUTH));
			return;
		}
		if (state.session.actionLocked) {
			return;
		}

		dispatch(actionLock());
		dispatch(toggleFlagRequest(postIndex));
		PostService.changeFlag(post.author, PostService.getPermlinkFromUrl(post.url), newFlagState)
			.then(response => {
				dispatch(actionUnlock());
				dispatch(toggleFlagSuccess(postIndex, response));
				dispatch(updatePost(postIndex, 0, newFlagState));
				dispatch(updateVotingPower(username));
				let text = `The post has been successfully flaged. If you don't see your flag, please give it a few minutes to sync from the blockchain`;
				if (!newFlagState) text = `The post has been successfully unflaged. If you don't see your flag, please give it a few minutes to sync from the blockchain`;
				dispatch(pushMessage(text));
			})
			.catch(error => {
				dispatch(actionUnlock());
				dispatch(toggleFlagError(postIndex, error));
				dispatch(pushErrorMessage(error));
			});
	};
}
