const initialState = {
	amount: 0.001,
	amountError: '',
	selectedToken: 0,
	tokenValue: [
		0,
		0
	]
};

export default function wallet(state = initialState, action) {
	switch (action.type) {
		case 'WALLET_SET_TOKEN':
			return {
				...state,
				selectedToken: action.value
			};
		case 'WALLET_CHANGE_AMOUNT':
			return {
				...state,
				amount: action.value,
				amountError: ''
			};
		case 'TRANSFER_ERROR':
			if (action.amountError) {
				return {
					...state,
					amountError: action.amountError
				};
			}
			return state;
		case 'GET_USER_PROFILE_SUCCESS':
			return {
				...state,
				tokenValue: [
					action.profile.balance,
					action.profile.sbd_balance
				]
			};
		case 'CLOSE_MODAL':
			if (action.index === 'transfer' || action.index === 'powerUp' || action.index === 'powerDown') {
				return {
					...initialState,
					tokenValue: state.tokenValue
				};
			}
			return state;
		default:
			return state;
	}
}
