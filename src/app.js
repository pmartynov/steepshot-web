import React from 'react';
import {Provider} from 'react-redux';
import {WrapperProvider} from 'create-react-server/wrapper';
import configureStore from './store/configureStore';
import getRoutes from './routes';
import createMemoryHistory from 'history/createMemoryHistory';
import createBrowserHistory from 'history/createBrowserHistory';
import {ConnectedRouter} from 'react-router-redux';
import './styles/main.css';
import './styles/app.css';

export default ({state, props}) => {
	const history = global.isServerSide ? createMemoryHistory() : createBrowserHistory();
	const store = configureStore(state, history);
	return (
		<Provider store={store}>
			{global.isServerSide ?
				(<WrapperProvider initialProps={props}>
					{getRoutes()}
				</WrapperProvider>)
				:
				(<ConnectedRouter history={history}>
					<WrapperProvider initialProps={props}>
						{getRoutes()}
					</WrapperProvider>
				</ConnectedRouter>)}
		</Provider>
	);
};