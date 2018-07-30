import Constants from '../common/constants';
import ChainService from './ChainService';
import SteemService from './SteemService';
import GolosService from './GolosService';
import AuthService from './AuthService';
import SteemConnect from './SteemConnect';
import Utils from '../utils/Utils';

let config = Constants.SERVICES.steem;

class RequestService {

	static init(serviceName) {
		switch (serviceName) {
			case Constants.SERVICES.golos.name:
				ChainService.init(new GolosService());
				config = Constants.SERVICES.golos;
				break;
			case Constants.SERVICES.steem:
			default:
				let steemService = SteemService;
				if (AuthService.isAuthWithToken()) {
					steemService = SteemConnect;
				}
				ChainService.init(new steemService());
				config = Constants.SERVICES.steem;
				break;
		}
	}

	static getLoggingUrl() {
		return config.loggingUrl;
	}

	static get(url, options) {
		let fullUrl;
		if (!url.includes('http')) {
			fullUrl = `${config.baseUrl}/${url}${convertOptionsToRequestString(options)}`;
		} else {
			fullUrl = `${url}${convertOptionsToRequestString(options)}`;
		}
		return fetch(fullUrl, {
			method: 'GET'
		})
			.then(RequestService.processResponse)
	}

	static post(url, data) {
		if (!url.includes('http')) {
			url = `${config.baseUrl}/${url}`;
		}
		const options = {
			method: 'POST'
		};
		if (data instanceof FormData) {
			options.body = data;
		} else {
			options.headers = {'Content-Type': 'application/json'};
			options.body = JSON.stringify(data);
		}
		return fetch(url, options)
			.then(RequestService.processResponse);
	}

	static processResponse(response) {
		if ((response.status === 200) || (response.status === 201)) {
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.indexOf("application/json") !== -1) {
				return response.json();
			}
			return response;
		}
		return Promise.reject(response);
	}
}

export default RequestService;

function convertOptionsToRequestString(options) {
	if (!options) return '';

	let optionsArray = [];
	for (let key in options) {
		if (Utils.isNotEmpty(options[key])) optionsArray.push(key + '=' + convertIfBool(options[key]));
	}
	return '?' + optionsArray.join('&');
}

function convertIfBool(option) {
	if (option === true) {
		return "1";
	} else if (option === false) {
		return "0";
	} else {
		return option;
	}
}