import {getStore} from '../store/configureStore';
import {updatePost} from './post';
import {updateVotingPower} from './auth';
import {pushMessage} from "./pushMessage";
import {actionLock, actionUnlock} from "./session";
import PostService from "../services/postService";

function toggleVoteRequest(postIndex) {
	return {
		type: 'TOGGLE_VOTE_REQUEST',
		index: postIndex,
	};
}

function toggleVoteSuccess(postIndex, response) {
	return {
		type: 'TOGGLE_VOTE_SUCCESS',
		index: postIndex,
		response
	};
}

function toggleVoteError(postIndex, error) {
	return {
		type: 'TOGGLE_VOTE_ERROR',
		index: postIndex,
		error
	};
}

export function toggleVote(postIndex) {
	return function (dispatch) {
		let state = getStore().getState();
		let username = state.auth.user;
		let postingKey = state.auth.postingKey;
		let post = state.posts[postIndex];
		const newVoteState = !post.vote;
		let power = state.auth.like_power * 100;
		if (!username && !postingKey) {
			return;
		}
		if (state.session.actionLocked) {
			return;
		}
		dispatch(actionLock());
		dispatch(toggleVoteRequest(postIndex));

		PostService.changeVote(post.author, PostService.getPermlinkFromUrl(post.url), newVoteState, power)
			.then(response => {
				dispatch(actionUnlock());
				dispatch(toggleVoteSuccess(postIndex, response));
				dispatch(updatePost(postIndex, newVoteState, 0));
				dispatch(updateVotingPower(username));
				let text = `The post has been successfully liked. If you don't see your like, please give it a few minutes to sync from the blockchain`;
				if (!newVoteState) text = `The post has been successfully disliked. If you don't see your dislike, please give it a few minutes to sync from the blockchain`;
				dispatch(pushMessage(text));
			})
			.catch(error => {
				dispatch(actionUnlock());
				dispatch(toggleVoteError(postIndex));
				dispatch(pushMessage(error));
			})
	};
}
