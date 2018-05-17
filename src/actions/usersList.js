import {getStore} from '../store/configureStore';
import UserService from "../services/userService";

export function initUsersList(options) {
	return {
		type: 'INIT_USERS_LIST',
		options
	};
}

export function clearUsersList(point) {
	return {
		type: 'CLEAR_USERS',
		point
	};
}

function getUsersListRequest(point) {
	return {
		type: 'GET_USERS_LIST_REQUEST',
		point
	};
}

function getUsersListSuccess(options, users) {
	return {
		type: 'GET_USERS_LIST_SUCCESS',
		options,
		users
	};
}

function getUsersListError(point, error) {
	return {
		type: 'GET_USERS_LIST_ERROR',
		point,
		error
	};
}


export function getUsersList(point) {
	const LIMIT = 16;
	let statePoint = getStore().getState().usersList[point];
	if (statePoint.loading) {
		return {
			type: 'EMPTY_GET_USERS'
		}
	}
	if (!statePoint.hasMore) {
		return {
			type: 'ALL_USERS_LOADED',
			point
		}
	}
	return (dispatch) => {
		dispatch(getUsersListRequest(point));
		UserService.getUsersList(point.substr(0, point.indexOf('JSON_OPTIONS:')), statePoint.offset, LIMIT, statePoint.options)
			.then((response) => {
				statePoint = getStore().getState().usersList[point];
				let newUsers = response.results;
				let hasMore = response.offset !== statePoint.offset;
				if (statePoint.users.length !== 0) {
					newUsers = newUsers.slice(1, newUsers.length);
				}
				let uniqueUsers = [];
				newUsers.forEach(user => {
					if (statePoint.users.indexOf(user.author) === -1) {
						uniqueUsers.push(user);
					}
				});
				newUsers = uniqueUsers;
				let authors = newUsers.map((user) => {
					return user.author;
				});
				let users = {};
				newUsers.forEach((user) => {
					users[user.author] = {
						...user,
						togglingFollow: false
					};
				});

				let pointOptions = {
					point,
					hasMore,
					users: authors,
					offset: newUsers[newUsers.length - 1] ? newUsers[newUsers.length - 1].author : statePoint.offset,
				};

				dispatch(getUsersListSuccess(pointOptions, users));
			}).catch(error => {
			dispatch(getUsersListError(point, error));
		});
	};
}

function updateUserSuccess(updatedUser) {
	return {
		type: 'UPDATE_USER_SUCCESS',
		updatedUser
	}
}

function updateUserRequest(author) {
	return {
		type: 'UPDATE_USER_REQUEST',
		author
	}
}

export function updateUser(author) {
	return (dispatch) => {
		dispatch(updateUserRequest(author));

		UserService.getUsersList('user/search', undefined, 1, {query: author})
			.then((response) => {
				let updatedUser = {[author]: {...response.results[0], togglingFollow: false}};
				dispatch(updateUserSuccess(updatedUser));
			})
			.catch( error => {
				dispatch({
					type: 'UPDATE_USER_ERROR',
					error
				})
			});
	}
}