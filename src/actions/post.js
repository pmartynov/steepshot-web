import Steem from '../libs/steem';
import {getStore} from '../store/configureStore';
import Constants from '../common/constants';
import {debounce} from 'lodash';

function sendDeleteRequest(postIndex) {
  return {
    type: 'SEND_DELETE_REQUEST',
    postIndex: postIndex
  };
}

function successDeleteResponse(postIndex) {
  return {
    type: 'SUCCESS_DELETE_RESPONSE',
    postIndex: postIndex
  };
}

function failureDeleteResponse(postIndex) {
  return {
    type: 'FAILURE_DELETE_RESPONSE',
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

    dispatch(sendDeleteRequest(postIndex));

    const callback = (err, success) => {
      sessionStorage.setItem('voteQueue', 'false');

      if (success) {
        dispatch(successDeleteResponse(postIndex));
        let text = 'The post has been successfully deleted. If you still see your post, please give it a few minutes to sync from the blockchain';
        jqApp.pushMessage.open(text);
      } else if (err) {
        console.log(err);
        let text = 'We are sooorry... The post can\'t be deleted';
        jqApp.pushMessage.open(text);
        dispatch(failureDeleteResponse(postIndex));
        // const nullCreateDeleteCallback = () => {
        //   if (success) {
        //     dispatch(successDeleteResponse(postIndex));
        //     let text = 'The post has been successfully deleted. If you still see your post, please give it a few minutes to sync from the blockchain';
        //     jqApp.pushMessage.open(text);
        //   } else if (err) {
        //     dispatch(failureDeleteResponse(postIndex));
        //     console.log(err);
        //     let text = 'We are sooorry... The post can\'t be deleted';
        //     jqApp.pushMessage.open(text);
        //   }
        // };

        // Steem.createPost(postingKey, null, username, null, null, deletedFile, nullCreateDeleteCallback);
      }
    };
    Steem.deletePost(postingKey, username, permlink, callback);
  }
}
