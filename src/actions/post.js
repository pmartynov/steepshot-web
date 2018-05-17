import {getStore} from '../store/configureStore';
import {initPostsList} from './postsList';
import {initPostModal} from './postModal';
import {pushMessage} from './pushMessage';
import {actionLock, actionUnlock} from './session';
import Constants from "../common/constants";
import PostService from "../services/postService";

function addPosts(posts) {
	return {
		type: 'ADD_POSTS',
		posts
	}
}

export function updatePost(postIndex, newVoteState, newFlagState) {
	return (dispatch) => {
		if (!postIndex.includes('#')) {
			updatePostData(dispatch, postIndex);
		} else {
			updateCommentData(dispatch, postIndex, newVoteState, newFlagState)
		}
	}
}

function updatePostData(dispatch, postUrl) {
	PostService.getPost(postUrl)
		.then((result) => {
			dispatch({
				type: 'UPDATE_POST',
				post: result
			})
		});
}

function updateCommentData(dispatch, postIndex, newVoteState, newFlagState) {
	let newItem = getStore().getState().posts[postIndex];
	if (newVoteState !== 0) {
		newVoteState ? newItem.net_votes++ : newItem.net_votes--;
		newVoteState ? newItem.net_likes++ : newItem.net_likes--;
	}
	if (newFlagState !== 0) {
		newFlagState ? newItem.net_flags++ : newItem.net_flags--;
	}
	if (newItem.vote && newFlagState) {
		newItem.vote = false;
		newItem.net_votes--;
		newItem.net_likes--;
	}
	if (newItem.flag && newVoteState) {
		newItem.flag = false;
		newItem.net_flags--;
	}
	newItem.vote = newVoteState;
	newItem.flag = newFlagState;
	dispatch({
		type: 'UPDATE_COMMENT',
		[postIndex]: newItem
	});
}

export function setPowerLikeInd(postIndex, isOpen) {
	return (dispatch) => {
		dispatch({
			type: 'POWER_OF_LIKE_IND',
			index: postIndex,
			isPLOpen: isOpen
		})
	}
}

export function setPowerLikeTimeout(postIndex, timeout) {
	return (dispatch) => {
		dispatch({
			type: 'POWER_OF_LIKE_TIMEOUT',
			index: postIndex,
			plTimeout: timeout
		})
	}
}

export function setChangeStatus(postIndex, param) {
	return (dispatch) => {
		dispatch({
			type: 'POWER_OF_LIKE_CHANGE_STATUS',
			index: postIndex,
			changeStatus: param
		})
	}
}

export function setHidePowerLikeTimeout(postIndex, timeout) {
	return (dispatch) => {
		dispatch({
			type: 'HIDE_POWER_OF_LIKE_TIMEOUT',
			index: postIndex,
			hplTimeout: timeout
		})
	}
}

export function setSliderWidth(postIndex, width) {
	return (dispatch) => {
		dispatch({
			type: 'SET_SLIDER_TIMEOUT',
			index: postIndex,
			sliderWidth: width
		})
	}
}

function deletePostRequest(postIndex) {
	return {
		type: 'DELETE_POST_REQUEST',
		index: postIndex
	}
}

function deletePostSuccess(postIndex) {
	return {
		type: 'DELETE_POST_SUCCESS',
		index: postIndex
	}
}

function deletePostError(postIndex) {
	return {
		type: 'DELETE_POST_ERROR',
		index: postIndex
	}
}

export function deletePost(postUrl) {
	return function (dispatch) {
		let state = getStore().getState();
		if (state.session.actionLocked) {
			return;
		}
		dispatch(actionLock());
		dispatch(deletePostRequest(postUrl));
		PostService.deletePost(state.posts[postUrl])
			.then(response => {
				dispatch(actionUnlock());
				dispatch(deletePostSuccess(postUrl, response));
				dispatch(pushMessage(Constants.DELETE.DELETE_SUCCESS));
			})
			.catch(error => {
				dispatch(actionUnlock());
				dispatch(deletePostError(postUrl, error));
				dispatch(pushMessage(error));
			});
	}
}

export function addSinglePost(url) {
	return async dispatch => {
		const urlObject = url.split('/');
		if (urlObject.length < 3) {
			error(dispatch);
		} else {
			await PostService.getPost(url)
				.then((result) => {
					if (result) {
						let postOptions = {
							point: 'SinglePost',
							maxPosts: 1,
							loading: false,
							posts: [result.url],
							length: 0,
							hasMore: false,
						};
						dispatch(initPostsList(postOptions));
						dispatch(addPosts({
							[result.url]: {
								...result, isVideo: result.media[0].url.match(/mp4$/i)
							}
						}));
						dispatch(initPostModal('SinglePost', result.url));
					} else {
						error(dispatch);
					}
				});
		}
	}
}

function error(dispatch) {
	let state = getStore().getState();
	dispatch(pushMessage(
		'Something went wrong, please, check the URL or try again later'));
	setTimeout(() => {
		if (state.auth.name && state.auth.postingKey) {
			//browserHistory.push('/feed');
		} else {
			//browserHistory.push('/browse');
		}
	}, 3000);
}


export function playVideo(index) {
	return {
		type: 'POST_PLAY_VIDEO',
		index
	}
}

export function stopVideo(index) {
	return {
		type: 'POST_STOP_VIDEO',
		index
	}
}

export function setVideoTime(index, time) {
	return {
		type: 'SET_VIDEO_TIME',
		index,
		time
	}
}



