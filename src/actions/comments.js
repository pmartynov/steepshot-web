import {getStore} from "../store/configureStore";
import {clearTextInputState, setTextInputState} from "./textInput";
import {pushErrorMessage, pushMessage} from "./pushMessage";
import {actionLock, actionUnlock} from "./session";
import Constants from "../common/constants";
import CommentService from "../services/commentService";
import PostService from "../services/postService";
import {serverErrorsList} from "../utils/serverErrorsList";

export function initPostComment(point) {
	return {
		type: 'INIT_POST_COMMENTS',
		options: {
			point,
			loading: true,
			comments: [],
			sendingNewComment: false,
			scrollToLastComment: 0
		}
	}
}

export function getPostComments(point) {
	const post = getStore().getState().posts[point];
	if (!post) {
		return dispatch => {
			dispatch(pushMessage(Constants.OOOPS_SOMETHING_WRONG));
			dispatch({
				type: 'Can\'t find post.',
				point
			})
		}
	}

	return (dispatch) => {
		dispatch({
			type: 'GET_POST_COMMENT_REQUEST',
			point
		});
		CommentService.getCommentsList(post.author, post.url)
			.then(response => {
				const comments = response.results.reverse();
				if (!comments) {
					dispatch({
						type: 'GET_COMMENT_ERROR',
						response
					});
					return;
				}
				let commentsUrls = comments.map(comment => {
					return comment.url
				});
				let commentsObjects = {};
				for (let i = 0; i < comments.length; i++) {
					let comment = {
						...comments[i],
						parent_author: comments[i].url.replace(/.+\/@([\w-.]+)\/.+/, '$1'),
						parent_permlink: comments[i].url.replace(/.+\/@[\w-.]+\/([^/]+?)#.+/, '$1'),
						flagLoading: false,
						voteLoading: false,
						postDeleting: false
					};
					commentsObjects[comments[i].url] = comment;
				}
				dispatch({
					type: 'GET_POST_COMMENTS_SUCCESS',
					point,
					commentsUrls,
					posts: commentsObjects,
				});
			})
			.catch(error => {
				let checkedError = serverErrorsList(error.status);
				dispatch({
					type: 'GET_POST_COMMENTS_ERROR',
					point,
          checkedError
				});
			});
	}
}

function addNewCommentRequest(point) {
	return {
		type: 'ADD_NEW_COMMENT_REQUEST',
		point
	}
}

function addNewCommentSuccess(point, response) {
	return {
		type: 'ADD_NEW_COMMENT_SUCCESS',
		point,
		response
	}
}

function addNewCommentError(point, error) {
	return {
		type: 'ADD_NEW_COMMENT_ERROR',
		point,
		error
	}
}

function scrollToLastComment(postIndex) {
	return {
		type: 'SCROLL_TO_LAST_COMMENT',
		postIndex
	}
}

function addedNewComment(point, posts, url) {
	return dispatch => {
		dispatch({
			type: 'ADDED_NEW_COMMENT',
			point,
			posts,
			url
		})
	}
}

function setFocusTextInput(isFocused) {
  return {
    type: 'SET_FOCUS_TEXT_INPUT',
    point: Constants.TEXT_INPUT_POINT.COMMENT,
		isFocused
  }
}

export function setCommentEditState(point, parentPost, commentEditing) {
	return dispatch => {
		dispatch({
      type: 'SET_COMMENT_EDIT_STATE',
      editingPostPoint: point,
      parentPost,
      commentEditing
		});
    if (!commentEditing) {
      dispatch(setFocusTextInput(commentEditing));
      dispatch(setTextInputState('comment', {text: ''}));
    }
	}
}

export function setInputForEdit(point, parentPost, commentEditing) {
  let commentText = getStore().getState().posts[point].body;
  return dispatch => {
    dispatch(setCommentEditState(point, parentPost, commentEditing));
    dispatch(setFocusTextInput(commentEditing));
    dispatch(setTextInputState('comment', {text: commentText}));
  }
}

export function editComment(postIndex, point) {

}

export function sendComment(postIndex, point) {
	let state = getStore().getState();
	let post = state.posts[postIndex];
	let comment = state.textInput[point].text;
	return (dispatch) => {
		if (state.session.actionLocked) {
			return;
		}
		dispatch(actionLock());
		dispatch(addNewCommentRequest(postIndex));

		CommentService.addComment(post.author, PostService.getPermlinkFromUrl(post.url), comment)
			.then(response => {
				dispatch(actionUnlock());
				dispatch(addNewCommentSuccess(postIndex, response));
				const url = postIndex + '#@' + state.auth.user + '/' + response.operations[0][1].permlink;
				const newComment = {
					net_votes: 0,
					net_likes: 0,
					vote: false,
					avatar: state.auth.avatar,
					author: state.auth.user,
					total_payout_value: 0,
					body: comment,
					created: Date.now(),
					flagLoading: false,
					voteLoading: false,
					url
				};
				dispatch(addedNewComment(postIndex, {[url]: newComment}, url));
				dispatch(clearTextInputState(point));
				dispatch(scrollToLastComment(postIndex));
				dispatch(pushMessage(Constants.COMMENT_SUCCESS_MESSAGE));
			})
			.catch( error => {
				dispatch(actionUnlock());
				dispatch(addNewCommentError(postIndex, error));
				dispatch(pushErrorMessage(error));
			})
	};
}

export function replyAuthor(name) {
	let text = getStore().getState().textInput[Constants.TEXT_INPUT_POINT.COMMENT].text || '';
	text = text.replace(/^@[^,]+, ?/g, '');
	return dispatch => {
		dispatch({
			type: 'TEXT_INPUT_SET_STATE',
			point: Constants.TEXT_INPUT_POINT.COMMENT,
			state: {
				focusedStyle: 'focused_tex-inp',
				text: `@${name}, ${text}`,
				error: ''
			}
		});
		dispatch(setFocusTextInput(true));
	}
}