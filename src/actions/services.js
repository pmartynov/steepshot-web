import RequestService from '../services/RequestService';
import Constants from '../common/constants';
import {getStore} from '../store/configureStore';
import storage from '../utils/Storage';

export function setService(serviceName = storage.service || Constants.SERVICES.steem.name) {
	RequestService.init(serviceName);
	return {
		type: 'SET_SERVICE',
		serviceName
	}
}

export function switchService() {
	const serviceName = getStore().getState().services.name;
	return dispatch => {
		if (serviceName === Constants.SERVICES.steem.name) {
			dispatch(setService(Constants.SERVICES.golos.name));
		} else {
			dispatch(setService(Constants.SERVICES.steem.name));
		}
	}
}