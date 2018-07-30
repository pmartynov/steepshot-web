import {getStore} from '../store/configureStore';
import Constants from '../common/constants';
import storage from '../utils/Storage';
import {pushMessage} from './pushMessage';
import {updateSettings} from './settings';
import OneSignalService from '../services/OneSignalService';

let OneSignal = window.OneSignal;

export function loadSubscribeData() {
	try {
		OneSignal.on('subscriptionChange', subscribeListener);
		return async dispatch => {
			let playerId = await OneSignal.getUserId();
			let notificationPermission = await OneSignal.getNotificationPermission();
			let isNotificationsEnabled = await OneSignal.isPushNotificationsEnabled();
			if ((notificationPermission === Constants.ONE_SIGNAL.STATES.DEFAULT) && !storage.shownSubscribe) {
				subscribe();
			}
			dispatch(setOneSignalData(playerId, notificationPermission, isNotificationsEnabled));
		}
	} catch (e) {
		return {
			type: 'ONE_SIGNAL_ERROR',
			error: e
		}
	}
}

function setOneSignalData(playerId, notificationPermission, isNotificationsEnabled) {
	return {
		type: 'SET_ONE_SIGNAL_DATA',
		playerId,
		notificationPermission,
		isNotificationsEnabled
	}
}

function setSubscription(isNotificationsEnabled) {
	return {
		type: 'SET_ONE_SIGNAL_DATA',
		isNotificationsEnabled
	}
}

export function subscribe() {
	return dispatch => {
		try {
			const playerId = getStore().getState().oneSignal.playerId;
			if (playerId != null) {
				OneSignal.setSubscription(true);
				dispatch(setSubscription(true));
			} else {
				OneSignal.registerForPushNotifications({
					modalPrompt: true
				});
				dispatch(updateSettings());
				storage.shownSubscribe = true;
			}
		} catch (e) {
			dispatch({
				type: 'ONE_SIGNAL_ERROR',
				error: e
			})
		}
	}
}

export function unsubscribe() {

	return dispatch => {
		try {
			OneSignal.setSubscription(false);
			dispatch(setSubscription(false));
		} catch (e) {
			console.error(e);
			return;
		}
	}

}

async function subscribeListener(isSubscribed) {
	try {
		const store = getStore();
		let playerId = await OneSignal.getUserId();
		let notificationPermission = await OneSignal.getNotificationPermission();
		let isNotificationsEnabled = await OneSignal.isPushNotificationsEnabled();
		let user = store.getState().auth.user;
		if (isSubscribed) {
			OneSignalService.addNotificationTags(user, playerId);
			store.dispatch(setSubscription(true));
		} else {
			OneSignalService.removeNotificationTags();
		}
		store.dispatch(setOneSignalData(playerId, notificationPermission, isNotificationsEnabled));
		store.dispatch({
			type: 'SUBSCRIBE_SUCCESS'
		});
	} catch (e) {
		return {
			type: 'ONE_SIGNAL_ERROR',
			error: e
		}
	}
}

export function setSubscribeOnBackend() {
	const state = getStore().getState();
	const settings = state.settings;
	const player_id = state.oneSignal.playerId;
	const app_id = state.oneSignal.appId;
	const username = state.auth.user;

	return dispatch => {
		dispatch({
			type: 'SET_SUBSCRIPTION_ON_BACKEND_REQUEST'
		});

		OneSignalService.setSubscribeConfiguration(username, player_id, app_id, settings)
			.then(() => {
				dispatch({
					type: 'SET_SUBSCRIBE_ON_BACKEND_SUCCESS',
					settings,
					player_id
				})
			})
			.catch(error => {
				dispatch({
					type: 'SET_SUBSCRIBE_ON_BACKEND_ERROR',
					error,
					settings,
					player_id
				})
			});
	}
}

export function changeUserSubscribe() {
	const state = getStore().getState();
	const profile = state.userProfile.profile;
	const subscribed = profile['is_subscribed'];
	const player_id = state.oneSignal.playerId;
	const app_id = state.oneSignal.appId;
	const subscriber = state.auth.user;

	return dispatch => {
		dispatch({
			type: 'CHANGE_USER_SUBSCRIBE_REQUEST'
		});
		OneSignalService.changeSubscribeOnUser(subscriber, profile.username, player_id, app_id, subscribed).then(() => {
			dispatch(pushMessage(`User has been successfully ${subscribed ? 'un' : ''}subscribed.`));
			dispatch({
				type: 'CHANGE_USER_SUBSCRIBE_SUCCESS'
			});
		})
			.catch(error => {
				dispatch(pushMessage(error));
				dispatch({
					type: 'CHANGE_USER_SUBSCRIBE_ERROR',
					error
				});
			});

	}
}