import Constants from '../common/constants';
import Utils from '../utils/Utils';

export default function windowOnStore(state = getActualState(), action) {
	switch (action.type) {
		case 'RESIZE_WINDOW':
			return getActualState();
		default:
			return state;
	}
}

function getActualState() {
	const windowDimension = Utils.getWindowDimension();
	return {
		...windowDimension,
		isMobileScreen: windowDimension.width <= Constants.WINDOW.MAX_MOBILE_SCREEN_WIDTH
	}
}