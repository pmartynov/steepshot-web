import {getStore} from "../store/configureStore";
import {utils} from "../utils/utils";
import {clearTextInputState, setTextInputError} from "./textInput";
import * as React from "react";
import PlagiarismTracking from "../components/Modals/PlagiarismTracking/PlagiarismTracking";
import {openModal} from "./modal";
import {push} from "react-router-redux";
import {compressJPEG} from "../utils/compressor";
import {pushMessage} from "./pushMessage";
import Constants from "../common/constants";
import PostService from "../services/postService";
import UserService from "../services/userService";

const getUserName = () => {
	return getStore().getState().auth.user;
};

export function addTag() {
	return (dispatch) => {
		const state = getStore().getState();
		const editPostState = state.editPost;
		let newTag = state.textInput[Constants.TEXT_INPUT_POINT.TAGS].text;
		newTag = getValidTagsString(newTag);
		if (editPostState.tags.split(' ').length === 20) {
			dispatch(pushMessage(Constants.MAX_TAGS_NUMBER));
		}
		if (utils.isEmptyString(newTag)) {
			return emptyAction();
		}
		dispatch(editPostChangeTags(getValidTagsString(editPostState.tags + ' ' + newTag.trim())));

		dispatch(clearTextInputState(Constants.TEXT_INPUT_POINT.TAGS));
	}
}

export function removeTag(index) {
	const tagsString = getStore().getState().editPost.tags;
	let tagsList = tagsString.toLowerCase().split(' ');
	tagsList.splice(index, 1);
	return dispatch => {
		dispatch(editPostChangeTags(tagsList.join(' ')));
	}
}

export function changeImage(imageSrc, image) {
	return dispatch => {
		if (!isValidImageSize(dispatch, image)) {
			return;
		}
		dispatch({
			type: 'EDIT_POST_CHANGE_IMAGE',
			image: imageSrc
		})
	}
}

export function imageRotate(image) {
	let rotate = getStore().getState().editPost.rotate;
	rotate = (rotate + 90) % 360;
	const imageSize = {
		width: image.naturalWidth,
		height: image.naturalHeight
	};
	if (rotate % 180) {
		const tmp = imageSize.width;
		imageSize.width = imageSize.height;
		imageSize.height = tmp;
	}
	return dispatch => {
		if (!isValidImageSize(dispatch, imageSize)) {
			return;
		}
		dispatch({
			type: 'EDIT_POST_ROTATE_IMAGE',
			rotate
		})
	}
}

export function setImageContainerSize(width, height) {
	return {
		type: 'EDIT_POST_CHANGE_IMAGE_SIZE',
		width,
		height
	}
}

export function editClearAll() {
	return dispatch => {
		dispatch({type: 'EDIT_POST_CLEAR_ALL'});
		dispatch(clearInputFields());
	}
}

export function imageNotFound() {
	return {
		type: 'EDIT_POST_IMAGE_NOT_FOUND'
	}
}

export function closeTimer() {
	return {
		type: 'EDIT_POST_CLOSE_TIMER'
	}
}

export function editPostClear() {
	const initDataEditPost = getStore().getState().editPost.initData;
	return dispatch => {
		if (initDataEditPost && initDataEditPost.src) {
			dispatch({type: 'EDIT_POST_CLEAR_FIELDS'})
		} else {
			dispatch({type: 'EDIT_POST_CLEAR_ALL'});
		}
		dispatch(clearInputFields());
	}
}

export function setInitDataForEditPost(postUrl) {
	const username = getStore().getState().auth.user;
	return (dispatch) => {
		if (!username || !postUrl) {
			dispatch(createNewPost())
		} else {
			PostService.getPost(postUrl)
				.then((response) => {
					dispatch({
						type: 'EDIT_POST_SET_INIT_DATA',
						initData: {
							src: response.media[0].url,
							tags: response.tags.join(' '),
							title: response.title,
							description: response.description,
							dataResponse: response
						}
					})
				})
				.catch(() => {
					dispatch(createNewPost());
				});
		}
	}
}

export function editPost() {
	const postData = getStore().getState().editPost.initData.dataResponse;
	let {title, tags, description} = prepareData();

	return (dispatch) => {
		if (!isValidField(dispatch, title, 'no empty string')) {
			return;
		}
		dispatch(editPostRequest());
		PostService.editPost(title, tags, description, PostService.getPermlinkFromUrl(postData.url), postData.media[0])
			.then(response => {
				dispatch(pushMessage(Constants.POST_SUCCESSFULLY_UPDATED));
				dispatch(editPostSuccess(response));
				dispatch(push(`/@${getUserName()}`))
			})
			.catch(error => {
				dispatch(editPostReject(error));
				dispatch(pushMessage(error.message));
			})
	}
}


export function createPost() {
	let {title, tags, description, photoSrc, rotate, isGif} = prepareData();

	return dispatch => {
		if (!isValidField(dispatch, title, photoSrc)) {
			return;
		}
		checkTimeAfterUpdatedLastPost()
			.then(() => {
				dispatch(editPostRequest());
				const dataType = 'image/gif';
				const image = new Image();
				image.src = photoSrc;
				image.onload = () => {
					let dataUrl = photoSrc;
					if (!isGif && rotate) {
						dataUrl = getCanvasWithImage(image, rotate).toDataURL(dataType, 1);
					}
					fetch(dataUrl).then(res => {
						return res.blob()
					})
						.then(blob => {
							if (!isGif && blob.size > Constants.IMAGE.MAX_SIZE) {
								console.log("compressing...");
								return compressJPEG(blob);
							}
							return new Promise(resolve => {
								resolve(blob);
							});

						})
						.then(blob => {
							return PostService.createPost(tags, title, description, blob)
						})
						.then(() => {
							dispatch(pushMessage(Constants.POST_SUCCESSFULLY_CREATED));
							dispatch(editPostSuccess());
							dispatch(push(`/@${getUserName()}`))
						})
						.catch(error => {
							if (error.data) {
								dispatch(editPostReject(error.data));
								dispatch(openModal("PlagiarismTrackingModal", {
									body: (<PlagiarismTracking data={error.data}/>)
								}))
							} else {
								throw error;
							}
						})
						.catch(error => {
							dispatch(editPostReject(error));
							dispatch(pushMessage(error));
						});
				}
			})
			.catch(error => {
				dispatch({
					type: 'EDIT_POST_SET_WAITING_TIME_SUCCESS',
					waitingTime: error
				})
			});
	}
}

function prepareData() {
	const state = getStore().getState();
	const editPostState = state.editPost;
	const textInputStates = state.textInput;

	const title = textInputStates.title.text;
	const description = textInputStates.description.text;
	const tags = getValidTagsString(editPostState.tags);
	const photoSrc = editPostState.src;
	const rotate = editPostState.rotate;
	const isGif = editPostState.isGif;

	return {title, description, tags, photoSrc, rotate, isGif};
}

function getValidTagsString(str) {
	if (str) {
		let result = str.replace(/\bsteepshot\b/g, '');
		result = result.replace(/(\b\w+\b)(.+)(\1)/g, '$1$2');
		result = result.trim();
		result = result.replace(/\s\s/g, ' ');
		result = result.replace(/[^\w\s]+/g, '');
		result = result.replace(new RegExp(`((\\s[^\\s]+){${Constants.TAGS.MAX_AMOUNT - 1}}).*`), '$1');
		result = result.replace(new RegExp(`(([^\\s]{${Constants.TAGS.MAX_LENGTH}})[^\\s]+).*`), '$2');
		return result.toLowerCase();
	}
}

function emptyAction() {
	return {
		type: 'EDIT_POST_EMPTY_ACTION',
	}
}

function editPostChangeTags(tagsString) {
	return {
		type: 'EDIT_POST_CHANGE_TAGS',
		value: tagsString,
	}
}

function createNewPost() {
	return dispatch => {
		UserService.getWaitingTimeForCreate(getUserName())
			.then(response => {
				dispatch({
					type: 'EDIT_POST_SET_WAITING_TIME_SUCCESS',
					waitingTime: response['waiting_time']
				})
			})
			.catch(error => {
				dispatch({
					type: 'EDIT_POST_SET_WAITING_TIME_ERROR',
					data: {
						error
					}
				})
			});

		dispatch({type: 'EDIT_POST_CREATE_NEW'});
		dispatch(clearInputFields());
	};
}

function clearInputFields() {
	return dispatch => {
		dispatch(clearTextInputState(Constants.TEXT_INPUT_POINT.TITLE));
		dispatch(clearTextInputState(Constants.TEXT_INPUT_POINT.TAGS));
		dispatch(clearTextInputState(Constants.TEXT_INPUT_POINT.DESCRIPTION));
	}
}

export function editPostSuccess(response) {
	return {
		type: 'EDIT_POST_SUCCESS',
		response
	};
}

export function editPostReject(error) {
	return {
		type: 'EDIT_POST_REJECT',
		error
	};
}

function checkTimeAfterUpdatedLastPost() {
	return UserService.getWaitingTimeForCreate(getUserName())
		.then(response => {
			const waitingTime = response['waiting_time'];
			if (waitingTime !== 0) {
				return Promise.reject(waitingTime)
			}
			return Promise.resolve();
		}).catch(() => {
			return Promise.resolve();
		});
}

function getCanvasWithImage(image, rotate) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (rotate % 180) {
		canvas.width = image.naturalHeight;
		canvas.height = image.naturalWidth;
	} else {
		canvas.width = image.naturalWidth;
		canvas.height = image.naturalHeight;
	}

	if (rotate === 90) {
		ctx.translate(canvas.width, 0);
	} else if (rotate === 180) {
		ctx.translate(canvas.width, canvas.height);
	} else if (rotate === 270) {
		ctx.translate(0, canvas.height);
	}

	ctx.rotate(rotate * Math.PI / 180);
	ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
	return canvas;
}

function isValidImageSize(dispatch, imageSize) {
	if (imageSize.width < Constants.IMAGE.MIN_WIDTH
		|| imageSize.height < Constants.IMAGE.MIN_HEIGHT) {
		const message = 'Photo size should be more than ' + Constants.IMAGE.MIN_WIDTH + 'x' + Constants.IMAGE.MIN_HEIGHT
			+ '. Your photo has ' + imageSize.width + 'x' + imageSize.height + '.';
		dispatch(setEditPostImageError(message));
		return false;
	}
	return true;
}

function isValidField(dispatch, title, photoSrc) {
	let isValid = true;
	if (utils.isEmptyString(title)) {
		dispatch(setTextInputError(Constants.TEXT_INPUT_POINT.TITLE, 'Title is required'));
		isValid = false;
	}
	if (utils.isEmptyString(photoSrc)) {
		dispatch(setEditPostImageError('Photo is required'));
		isValid = false;
	}
	return isValid;
}

export function setEditPostImageError(message) {
	return {
		type: 'EDIT_POST_SET_IMAGE_ERROR',
		message
	};
}

export function editPostRequest() {
	return {
		type: 'EDIT_POST_REQUEST'
	}
}
