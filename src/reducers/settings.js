import Constants from '../common/constants';
import storage from '../utils/Storage';

const initialState = storage.settings || Constants.SETTINGS.DEFAULT;

export default function settings(state = initialState, action) {
	switch (action.type) {
		case 'UPDATE_SETTINGS':
			return {
				...state,
				...action.settings
			};
		case 'REMOVE_SETTINGS':
			return initialState;
		default:
			return state;
	}
}
