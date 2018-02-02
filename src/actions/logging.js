import constants from '../common/constants';

const baseUrl = constants.URLS.baseUrl_v1;
let baseCORSOptions = {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
        'cache-control': 'no-cache',
        'content-Type': 'application/json'
    }
}

function notify(message, response, warn) {
    response.json().then((json) => {
        warn ? console.warn(message) : console.log(message);
        console.log(json);
    });
}

function makePostId(author, permlink) {
    return `@${author}/${permlink}`;
}

export async function logCORS(url, options, operation) {
    try {
        let success = await fetch(url, options)
        .then((response) => {
            if (response.ok) {
                if (response.status == 200) {
                    notify(`logCORS, ${operation}. Successfully logged`, response, false);
                } else {
                    notify(`logCORS, ${operation}. Response is OK but something went wrong`, response, true);
                }
            }
        })
        .catch((error) => {
            notify(`logCORS, ${operation}. Error`, error, true);
        });
    }
    catch(e) {
        notify(`logCORS, ${operation}. Catch block`, error, true);
    }
}

export function logLogin(data) {
    const url = `${baseUrl}/log/login-with-posting`;

    let options = baseCORSOptions;
    options.body = data;

    logCORS(url, options, 'login');
}

export function logComment(author, permlink, data) {
    const url = `${baseUrl}/log/post/${makePostId(author, permlink)}/comment`;

    let options = baseCORSOptions;
    options.body = data;

    logCORS(url, options, 'comment');
}

export function logFlag(author, permlink, data) {

    const url = `${baseUrl}/log/post/${makePostId(author, permlink)}/flag`;

    let options = baseCORSOptions;
    options.body = data;

    logCORS(url, options, 'flag');
}

export function logVoute(isVouteUp, author, permlink, data) {

    let vType = (isVouteUp) ? 'upvote' : 'downvote';

    const url = `${baseUrl}/log/post/${makePostId(author, permlink)}/${vType}`;

    let options = baseCORSOptions;
    options.body = data;

    logCORS(url, options, vType);
}

export function logPost(data) {

    const url = `${baseUrl}/log/post`;

    let options = baseCORSOptions;
    options.body = data;

    logCORS(url, options, 'post');
}

export function logFollow(isFollowed, user, data) {

    let fType = (isFollowed) ? 'unfollow' : 'follow';

    const url = `${baseUrl}/log/user/${user}/${fType}`;

    let options = baseCORSOptions;
    options.body = data;

    logCORS(url, options, fType);
}

export function logDeletedPost(author, permlink, data) {

    const url = `${baseUrl}/log/post/${makePostId(author, permlink)}/${data}`;

    let options = baseCORSOptions;
    options.body = data;

    logCORS(url, options, 'delete');
}

export function logSharePost(author, permlink) {
  const url = `${baseUrl}/log/post/${makePostId(author, permlink)}/info`;

  let options = baseCORSOptions;
  options.body = 'sharepost';

  logCORS(url, options, 'share post');
}
