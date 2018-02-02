import {getPostShaddow} from './posts';
import Steem from '../libs/steem';
import {getStore} from '../store/configureStore';
import {debounce} from 'lodash';
import {browserHistory} from 'react-router';
import {initPostsList} from './postsList';
import {initPostModal} from './postModal';

export function addPosts(posts) {
  return {
    type: 'ADD_POSTS',
    posts
  }
}

export function updatePost(postIndex) {
  return (dispatch) => {
    const urlObject = postIndex.split('/');
    getPostShaddow(urlObject[urlObject.length - 2] + '/' +
      urlObject[urlObject.length - 1]).then((result) => {
      dispatch({
        type: 'UPDATE_POST',
        post: result
      })
    });
  }
}

function sendDeletePost(postIndex) {
  return {
    type: 'SEND_DELETE_POST',
    index: postIndex
  }
}

function successDeletePost(postIndex) {
  return {
    type: 'SUCCESS_DELETE_POST',
    index: postIndex
  }
}

function failureDeletePost(postIndex) {
  return {
    type: 'FAILURE_DELETE_POST',
    index: postIndex
  }
}

export function deletePost(postIndex) {
  return function(dispatch) {
    let state = getStore().getState();
    let username = state.auth.user;
    let postingKey = state.auth.postingKey;
    const urlObject = postIndex.split('/');
    let permlink = urlObject[urlObject.length - 1];
    let queue = sessionStorage.getItem('voteQueue');
    if (queue == 'true')  {
      return false;
    }
    sessionStorage.setItem('voteQueue', 'true');

    dispatch(sendDeletePost(postIndex));

    const callback = (err, success) => {
      sessionStorage.setItem('voteQueue', 'false');

      if (success) {

        dispatch(successDeletePost(postIndex));

        let text = 'The post has been successfully deleted. If you still see your post, please give it a few minutes to sync from the blockchain';
        jqApp.pushMessage.open(text);
      } else if (err) {
        let text = 'We are sorry... it\'s impossible to delete this post';
        jqApp.pushMessage.open(text);
        dispatch(failureDeletePost(postIndex));
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

export function addSinglePost(url) {
  return dispatch => {
    const urlObject = url.split('/');

    if (urlObject.length < 3) {
      error();
    } else {
      getPostShaddow(getPostIdentifier(urlObject[urlObject.length - 2],
        urlObject[urlObject.length - 1]))
      .then((result) => {
        if (result) {
          let postOptions = {
            point: 'SinglePost',
            cancelPrevious: false,
            maxPosts: 1,
            loading: false,
            posts: [result.url],
            length: 0,
            hasMore: false,
          };
          dispatch(initPostsList(postOptions));
          dispatch(addPosts({[result.url]: result}));
          dispatch(initPostModal('SinglePost', result.url));
        } else {
          this.error();
        }
      });
    }
  }
}

function getPostIdentifier(author, permlink) {
  return `${author}/${permlink}`;
}

function error() {
  let state = getStore().getState();
  jqApp.pushMessage.open(
    'Something went wrong, please, check the URL or try again later');
  setTimeout(() => {
    if (state.auth.name && state.auth.postingKey) {
      browserHistory.push('/feed');
    } else {
      browserHistory.push('/browse');
    }
  }, 3000);
}




