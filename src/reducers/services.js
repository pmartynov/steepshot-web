import Constants from '../common/constants';

const initialState = {
	name: null,
	tokensNames: []
};

export default function services(state = initialState, action) {
	switch (action.type) {
		case 'SET_SERVICE':
			return {
				...state,
				name: action.serviceName,
				tokensNames: Constants.SERVICES[action.serviceName].tokensNames
			};
		default:
			return state;
	}
}
