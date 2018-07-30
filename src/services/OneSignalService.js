import Constants from '../common/constants';
import RequestService from './RequestService';
import ChainService from './ChainService';
import AuthService from './AuthService';

let OneSignal = window.OneSignal;

class OneSignalService {

	static addNotificationTags(username, playerId) {
		try {
			if (!username) {
				return;
			}
			if (playerId) {
				OneSignal.sendTags({username, player_id: playerId});
				return;
			}
			OneSignal.getUserId().then(playerId => {
				if (playerId) {
					OneSignal.sendTags({username, player_id: playerId});
				}
			})
		} catch (error) {
			console.error(error);
		}
	}

	static removeNotificationTags() {
		try {
			OneSignal.deleteTags(['username', 'player_id']);
		} catch (error) {
			console.error(error);
		}
	}

	static async setSubscribeConfiguration(username, player_id, app_id, settings) {
		if (!AuthService.isAuth()) {
			return;
		}

		const url = 'subscribe';
		let subscriptions = getSubscriptions(settings);
		let trx = await ChainService.getValidTransaction();

		const body = {
			username,
			player_id,
			app_id,
			subscriptions,
			trx
		};

		return RequestService.post(url, body);
	}

	static async changeSubscribeOnUser(subscriberName, subscribingName, player_id, app_id, subscribed) {
		const url = subscribed ? "unsubscribe" : "subscribe";
		let trx = await ChainService.getValidTransaction();

		const body = {
			username: subscriberName,
			player_id: 'c431f83e-98a6-4d2d-9ece-e7ccf3961faf',
			app_id,
			watched_user: subscribingName,
			trx
		};
		return RequestService.post(url, body);
	}
}

export default OneSignalService;

function getSubscriptions(settings) {
	let subscriptions = [];
	addNotEmptySetting(subscriptions, settings, Constants.SETTINGS.FIELDS.post);
	addNotEmptySetting(subscriptions, settings, Constants.SETTINGS.FIELDS.comment);
	addNotEmptySetting(subscriptions, settings, Constants.SETTINGS.FIELDS.follow);
	addNotEmptySetting(subscriptions, settings, Constants.SETTINGS.FIELDS.upvote);
	addNotEmptySetting(subscriptions, settings, Constants.SETTINGS.FIELDS.upvote_comment);
	return subscriptions;
}

function addNotEmptySetting(subscriptions, settings, field) {
	if (settings[field]) {
		subscriptions.push(field);
	}
}

