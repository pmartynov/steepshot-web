import React from 'react';
import {Redirect} from 'react-router-dom';
import RouteWithService from './RouteWithService';
import AuthService from '../../services/AuthService';

const PrivateRoute = ({component: Component, path}) => (
	AuthService.isAuth() ? <RouteWithService path={path} component={Component}/> : <Redirect to='/signin'/>
);

export default PrivateRoute;