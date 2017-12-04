import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import App from './components/App';
import Browse from './components/Browse/Browse';
import Login from './components/Account/Login';
import NotFound from './components/NotFound';
import Localization from './components/Localization/index';
import Signin from './components/Account/Login';
import UserProfile from './components/UserProfile/index';
import PrivateRoute from './components/Routes/PrivateRoute';
import Feed from './components/Feed/Feed';
import Profile from './components/Profile';
import Settings from './components/Settings';
import CreatePost from './components/Posts/CreatePost';
import SinglePostModalWrapper from './components/Wrappers/SinglePostModalWrapper';
import SearchWrapper from './components/Wrappers/SearchWrapper';
import AboutComponent from './components/About/AboutComponent';
import BrowseWrapper from './components/Wrappers/BrowseWrapper';

import Constants from './common/constants';

export default function getRoutes(store) {
  const clearMessages = () => {
    store.dispatch({
      type: 'CLEAR_MESSAGES'
    });
  };

  function setLanguages(nextState, replace, callback) {
    Localization.getInstance(callback);
  }

  let isUserLogin = !!store.getState().auth.user && !!store.getState().auth.postingKey;
  
  function baseBrowseFilter() {
    const baseBrowseFilter = localStorage.getItem('browse') == undefined ? 
    Constants.BROWSE_ROUTES[0].NAME : localStorage.getItem('browse');
    return baseBrowseFilter;
  }

  return (
    <App>
      <Switch>
        <Route exact path="/" render={() => (
          isUserLogin ? (
            <Redirect to="/feed"/>
          ) : (
            <Redirect to={`/browse/${baseBrowseFilter()}`} />
          )
        )}/>
        <Route path="/browse/:filter" component={BrowseWrapper} onLeave={clearMessages} />
        <Redirect path="/browse" to={`/browse/${baseBrowseFilter()}`} />
        <Route path="/@:username" component={UserProfile} onLeave={clearMessages} />
        <Route path="/signin" component={Signin} onLeave={clearMessages} />
        <Route path="/post" component={SinglePostModalWrapper} onLeave={clearMessages} />
        <Route path="/search/:searchValue" component={SearchWrapper} onLeave={clearMessages} />
        <Route path="/guide" component={AboutComponent} onLeave={clearMessages} />
        <PrivateRoute path="/feed" component={Feed} onLeave={clearMessages} />
        <PrivateRoute path="/createPost" component={CreatePost} onLeave={clearMessages} />
        <PrivateRoute path="/profile" component={Profile} onLeave={clearMessages} />
        <PrivateRoute path="/settings" component={Settings} onLeave={clearMessages} />
        <Route path="*" component={NotFound} onLeave={clearMessages} />
      </Switch>
    </App>
  );
}
