import Constants from "../common/constants";

class RequestService {

	static get(url, options) {
		const fullUrl = Constants.URLS.baseUrl_v1_1 + '/' + url + convertOptionsToRequestString(options);
		return fetch(fullUrl, {
			method: 'GET'
		}).then(RequestService.processResponse);
	}

	static post(url, data) {
		const options = {
			method: 'POST'
		};
		if (isJson(data)) {
			options.headers = {'Content-Type': 'application/json'};
			options.body = JSON.stringify(data)
		} else {
			options.body = data
		}

		return fetch(`${Constants.URLS.baseUrl_v1_1}/${url}`, options)
			.then(RequestService.processResponse);
	}

	static processResponse(response) {
		if (response.status === 200) {
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

function isJson(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

function convertOptionsToRequestString(options) {
	if (!options) return '';

	let optionsArray = [];
	for (let key in options) {
		if (options[key]) optionsArray.push(key + '=' + convertIfBool(options[key]));
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