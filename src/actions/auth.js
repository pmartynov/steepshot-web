import moment from 'moment';
import cookie from 'react-cookie';
import { browserHistory } from 'react-router';
import fakeAuth from '../components/Routes/fakeAuth';
import constants from '../common/constants';
import steem from 'steem';
import { getStore } from '../store/configureStore';
import Constants from '../common/constants';
import { logLogin } from './logging';

const baseUrl = constants.URLS.baseUrl_v1;

function getUrl() {
  if (getStore().getState().auth.user){
    return baseUrl + '/' + getStore().getState().auth.user
  }

  return baseUrl;
}

export function login(username, postingKey, history, dispatch, callback) {
  const account = null;
  steem.api.getAccounts([username], function(err, result) {  
    if (err) {
      callback('Something went wrong, please, try again later');
      return false;
    }
    if (result.length == 0) {
      callback("Such a user doesn't exist");
      return false;
    }
    let pubWif = result[0].posting.key_auths[0][0];
    let isValid = false;
    try { 
      isValid = steem.auth.wifIsValid(postingKey, pubWif); 
    }
    catch(e) { 
      console.log('login failure: ', e);
    }
    if (!isValid){ 
      callback('Invalid user name or posting key');
      return {
        type: 'LOGIN_FAILURE',
        messages: "Not valid user name or posting key"
      };
    } else {

      logLogin(JSON.stringify({ username : username }));

      let welcomeName = username;
      let metadata;
      localStorage.setItem('user', JSON.stringify(username));
      localStorage.setItem('postingKey', JSON.stringify(postingKey));
      localStorage.setItem('settings', JSON.stringify({ 
        [Constants.SETTINGS.show_low_rated]: false,
        [Constants.SETTINGS.show_nsfw]: false
      }));
      let avatar = null;
      if (result[0]) 
      if (result[0].json_metadata != "" && result[0].json_metadata != undefined) {
         metadata = JSON.parse(result[0].json_metadata);
         if (metadata.profile)
         if (metadata.profile.profile_image != "" && metadata.profile.profile_image != undefined) {
           avatar = metadata.profile.profile_image;
         }
      }
      localStorage.setItem('avatar', JSON.stringify(avatar));

      if (metadata)
      if (metadata.profile)
      if (metadata.profile.name) {
        welcomeName = metadata.profile.name;
      }

      callback('Welcome to Steepshot, ' +  welcomeName + ' !');

      dispatch({
        type: 'LOGIN_SUCCESS',
        postingKey: postingKey,
        user: username,
        avatar: avatar
      });
      setTimeout(function() {
        fakeAuth.authenticate(() => history.push('/feed'));
      }, 1);
    }
  });
}

function baseBrowseFilter() {
  const baseBrowseFilter = localStorage.getItem('browse') == undefined ? 
  Constants.BROWSE_ROUTES[0].NAME : localStorage.getItem('browse');
  return baseBrowseFilter;
}

export function logout(history, dispatch) {
  localStorage.removeItem('user');
  localStorage.removeItem('postingKey');
  localStorage.removeItem('settings');
  localStorage.removeItem('avatar');
  dispatch({
    type: 'LOGOUT_SUCCESS'
  });
  fakeAuth.signout(() => history.push(`/browse/${baseBrowseFilter()}`));
}

export function updateProfile(state, token) {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/account', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: state.email,
        name: state.name,
        gender: state.gender,
        location: state.location,
        website: state.website
      })
    }).then((response) => {
      if (response.ok) {
        return response.json().then((json) => {
          dispatch({
            type: 'UPDATE_PROFILE_SUCCESS',
            messages: [json]
          });
        });
      } else {
        return response.json().then((json) => {
          dispatch({
            type: 'UPDATE_PROFILE_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function changePassword(password, confirm, token) {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/account', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        password: password,
        confirm: confirm
      })
    }).then((response) => {
      if (response.ok) {
        return response.json().then((json) => {
          dispatch({
            type: 'CHANGE_PASSWORD_SUCCESS',
            messages: [json]
          });
        });
      } else {
        return response.json().then((json) => {
          dispatch({
            type: 'CHANGE_PASSWORD_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function deleteAccount(token) {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/account', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then((response) => {
      if (response.ok) {
        return response.json().then((json) => {
          dispatch(logout());
          dispatch({
            type: 'DELETE_ACCOUNT_SUCCESS',
            messages: [json]
          });
        });
      }
    });
  };
}
