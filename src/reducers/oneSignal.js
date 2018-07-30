import Constants from '../common/constants';

const initialState = {
	appId: Constants.ONE_SIGNAL.APP_ID,
	playerId: null,
	notificationPermission: null,
	isNotificationsEnabled: null,
	error: false
};

export default function oneSignal(state = initialState, action) {
	switch (action.type) {
		case 'SET_ONE_SIGNAL_DATA':
			return {
				...state,
				playerId: action.playerId || state.playerId,
				notificationPermission: action.notificationPermission || state.notificationPermission,
				isNotificationsEnabled: action.isNotificationsEnabled === undefined ? state.isNotificationsEnabled :
					action.isNotificationsEnabled
			};
		case 'ONE_SIGNAL_ERROR':
			return {
				...state,
				error: true
			};

		default:
			return state;
	}
}
