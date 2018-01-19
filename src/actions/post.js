import Steem from '../libs/steem';
import {getStore} from '../store/configureStore';
import Constants from '../common/constants';
import {debounce} from 'lodash';

function startRequest(postIndex) {
  return {
    type: 'START_REQUEST',
    postIndex: postIndex
  };
}

function resolveResponse(postIndex) {
  return {
    type: 'RESOLVE_RESPONSE',
    postIndex: postIndex
  };
}

function rejectedResponse(postIndex) {
  return {
    type: 'REJECT_RESPONSE',
    postIndex: postIndex
  };
}

export function deletePost(postIndex) {
  return function(dispatch) {
    let state = getStore().getState();
    let username = state.auth.user;
    let postingKey = state.auth.postingKey;
    let permlink = state.post.posts[postIndex];
    let postState = state.post.posts[postIndex];

    let queue = sessionStorage.getItem('voteQueue');
    if (queue == 'true')  {
      return false;
    }
    sessionStorage.setItem('voteQueue', 'true');

    dispatch(startRequest(postIndex));

    const callback = (err, success) => {
      sessionStorage.setItem('voteQueue', 'false');

      if (success) {
        dispatch(resolveResponse(postIndex));
        let text = 'The post has been successfully deleted. If you still see your post, please give it a few minutes to sync from the blockchain';
        jqApp.pushMessage.open(text);
      } else if (err) {
        console.log(err);

        const nullCreateDeleteCallback = () => {
          if (success) {
            dispatch(resolveResponse(postIndex));
            let text = 'The post has been successfully deleted. If you still see your post, please give it a few minutes to sync from the blockchain';
            jqApp.pushMessage.open(text);
          } else if (err) {
            dispatch(rejectedResponse(postIndex));
            console.log(err);
            let text = 'We are sooorry... The post can\'t be deleted';
            jqApp.pushMessage.open(text);
          }
        };

        Steem.createPost(postingKey, null, username, null, null, deletedFile, nullCreateDeleteCallback);
      }
    };
    Steem.deletePost(postingKey, username, permlink, callback);
  }
}
