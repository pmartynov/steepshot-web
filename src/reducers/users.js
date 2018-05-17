export default function users(state = {}, action) {
	switch (action.type) {
		case 'GET_USERS_LIST_SUCCESS':
			return {
				...state, ...action.users
			};
		case 'TOGGLE_FOLLOW_REQUEST':
			return {
				...state, [action.author]: {
					...state[action.author],
					togglingFollow: true
				}
			};
		case 'TOGGLE_FOLLOW_ERROR':
			return {
				...state, [action.author]: {
					...state[action.author],
					togglingFollow: false
				}
			};
		case 'TOGGLE_FOLLOW_SUCCESS':
			return {
				...state, [action.author]: {
					...state[action.author],
					togglingFollow: false,
					has_followed: !state[action.author]['has_followed']
				}
			};
		case 'UPDATE_USER_SUCCESS':
			const updatedUsers = {};
			for (const user in action.updatedUser) {
				updatedUsers[user] = {...state[user], ...action.updatedUser[user]}
			}

			return {
				...state, ...updatedUsers
			};
		default:
			return state;
	}
}
