import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import {createLogger} from 'redux-logger';
import rootReducer from '../reducers';
import {routerMiddleware} from 'react-router-redux';

let storeBase;

export default function configureStore(initialState, history) {
	const router = routerMiddleware(history);
	const logger = createLogger({
		collapsed: true
	});
	let middleware;
	if (process.env.NODE_ENV === 'production') {
		middleware = applyMiddleware(thunk, promise, router);
	} else {
		middleware = applyMiddleware(thunk, promise, logger, router);
	}

	const store = createStore(
		rootReducer,
		initialState,
		middleware
	);
	setStoreBase(store);
	return store;
}

function setStoreBase(newStore) {
	storeBase = newStore;
}

export function getStore() {
	if (!storeBase) {
		return configureStore();
	}
	return storeBase;
}
