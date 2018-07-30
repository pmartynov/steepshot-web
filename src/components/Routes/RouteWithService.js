import React from 'react';
import {Route} from 'react-router-dom';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';
import Utils from '../../utils/Utils';
import Constants from '../../common/constants';
import {setService} from '../../actions/services';
import AuthService from '../../services/AuthService';

class RouteWithService extends React.Component {

	constructor(props) {
		super();
		if (!props.pathname) {
			return;
		}
		if (props.pathname.includes('/' + Constants.SERVICES.golos.name)) {
			props.setService(Constants.SERVICES.golos.name);
		}
		if (!props.pathname.includes('/' + Constants.SERVICES.golos.name)
			&& props.serviceName === Constants.SERVICES.golos.name) {
			props.historyReplace('/golos' + props.pathname);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!Utils.equalsObjects(nextProps.pathname, this.props.pathname)
			&& nextProps.serviceName === Constants.SERVICES.golos.name
			&& !nextProps.pathname.includes('/' + Constants.SERVICES.golos.name)) {
			this.props.historyReplace('/golos' + nextProps.pathname);
		}
	}

	render() {
		const Component = this.props.component;
		return (
			<Route path={this.props.path} render={props => <Component {...props}/>}/>
		);
	}

}

const mapStateToProps = (state, props) => {
	const location = state.router.location || props.location || {};
	return {
		isAuthenticated: AuthService.isAuth(),
		pathname: location.pathname,
		serviceName: state.services.name
	}
};

const mapDispatchTOProps = dispatch => {
	return {
		historyReplace: newPath => {
			dispatch(replace(newPath))
		},
		setService: serviceName => {
			dispatch(setService(serviceName));
		}
	}
};

export default connect(mapStateToProps, mapDispatchTOProps)(RouteWithService);