import steem from 'steem';
import constants from '../common/constants';
import Promise from 'bluebird';
import { getStore } from '../store/configureStore';
import { preparePost, prepareComment } from '../actions/steemPayout';
import { logComment, logVoute, logFlag, logPost, logFollow, logDeletedPost } from '../actions/logging';

import _ from 'underscore';

const getUserName = () => {
    return getStore().getState().auth.user
}

class Steem {

    constructor(){
        steem.api.setOptions({ url: 'https://api.steemit.com' });
    }

    comment(wif, parentAuthor, parentPermlink, author, body, tags, callback) {
        const permlink = this._getPermLink();
        const commentObject = {
            parent_author: parentAuthor,
            parent_permlink: parentPermlink,
            author: author,
            permlink: permlink + '-post',
            title: "",
            body: body,
            json_metadata: JSON.stringify(this._createJsonMetadata(tags))
        };
        const commentOperation = [constants.OPERATIONS.COMMENT, commentObject];

        const callbackBc = (err, success) => {
            if(err) {
                callback(err, null);
                console.log(err);
            } else
            if (success) {
                const data = JSON.stringify({
                    username : author
                });
                logComment(parentAuthor, parentPermlink, data);
                callback(null, success);
            }
        };
        this.handleBroadcastMessagesComment(commentOperation, [], wif, callbackBc);
    }

    handleBroadcastMessagesComment(message, extetion, postingKey, callback) {
        let self = this;
        this._preCompileTransactionComment(message, postingKey)
        .then((response) => {
            if(response.ok) {
                let beneficiaries = self._getCommentBenificiaries(message[1].permlink);

                const operations = [message, beneficiaries];

                steem.broadcast.sendAsync(
                    { operations, extensions: [] },
                    { posting: postingKey }, callback
                );
            } else {
                response.json().then((result) => {
                    callback(result.username[0]);
                });
            };
        });
    }

    _preCompileTransactionComment(message, postingKey) {
        return steem.broadcast._prepareTransaction({
            extensions: [],
            operations: [message],
        })
        .then((transaction) => {
            return Promise.join(
                transaction,
                steem.auth.signTransaction(transaction, [postingKey])
            )
        })
        .spread((transaction, signedTransaction) => {
            return prepareComment(message, signedTransaction);
        });
    }

    _getCommentBenificiaries(permlink) {
        let beneficiariesObject = _.extend({}, {
            author: getUserName(),
            permlink: permlink,
            max_accepted_payout: constants.STEEM_PATLOAD.MAX_ACCEPTED_PAYOUT,
            percent_steem_dollars: constants.STEEM_PATLOAD.PERCENT_STEMM_DOLLARS,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
                [0, {
                    beneficiaries: [
                        {
                            account: 'steepshot',
                            weight: 1000
                        }
                    ]
                }]
            ]
        });


        return [constants.OPERATIONS.COMMENT_OPTIONS, beneficiariesObject];
    }

    vote(wif, username, author, url, voteStatus, callback) {
        const data = JSON.stringify({
            username : username
        });

        const callbackBc = (err, success) => {
            if(err) {
                callback(err, null);
                console.log(err);
            } else
            if (success) {
                logVoute(voteStatus, author, url, data);
                callback(null, success);
            }
        };

        steem.api.getContentAsync(author, url).then((response) => {
            steem.broadcast.vote(wif, username, response.author, response.permlink, voteStatus ? 10000 : 0, callbackBc);
        });
    }

    flag(wif, username, author, url, flagStatus, callback) {

        const callbackBc = (err, success) => {
            if (err) {
                callback(err, null);
                console.log(err);
            } else
            if (success) {
                const data = JSON.stringify({
                    username : username
                });
                logFlag(author, url, data);
                callback(null, success);
            }
        };

        steem.api.getContentAsync(author, url).then((response) => {
            steem.broadcast.vote(wif, username, response.author, response.permlink, flagStatus ? -10000 : 0, callbackBc);
        });
    }

    upVote() {
        //@TODO: Implement steem logic
    }

    downVote() {
        //@TODO: Implement steem logic
    }

    _sendBroadCasts(operations, postingWif) {
        let tx = steem.broadcast.sendAsync({ operations, extensions: [] }, { posting: postingWif });
    }

    _getBeneficiaries(permlink, beneficiaries) {
        let beneficiariesObject = _.extend({}, {
            author: getUserName(),
            permlink: permlink,
            max_accepted_payout: constants.STEEM_PATLOAD.MAX_ACCEPTED_PAYOUT,
            percent_steem_dollars: constants.STEEM_PATLOAD.PERCENT_STEMM_DOLLARS,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [[0, { beneficiaries : beneficiaries }]]
        })


        return [constants.OPERATIONS.COMMENT_OPTIONS, beneficiariesObject];
    }

    /** Follow an user */
    followUnfollowUser(wif, follower, following, status, callback) {

        let blog = ['blog'];
        if (status) blog = [];

        const json = JSON.stringify(
            [constants.OPERATIONS.FOLLOW, {
            follower: follower,
            following: following,
            what: blog
            }]
        );

        const callbackBc = (err, result) => {
            if (err) {
                callback(err);
                console.log(err);
            } else
            if (result) {
                const data = JSON.stringify({
                    username : follower
                });
                logFollow(status, following, data);
                callback(null, result);
            }
        }

        steem.broadcast.customJson(
            wif,
            [], // Required_auths
            [follower], // Required Posting Auths
            'follow', // Id
            json,
            callbackBc
        );
    }

    /** Broadcast a post */

    deletePost(wif, author, permlink, callback) {
      const callbackBc = (err, success) => {
        if (err) {
          callback(err, null);
        } else if (success) {
          logDeletedPost(author, permlink, 'deleted');
          callback(null, success);
        }
      };
      steem.broadcast.deleteComment(wif, author, permlink, callbackBc);
    }

    createPost(wif, tags, author, title, description, file, callback) {
        const permlink = this._getPermLink();
        const operation = [constants.OPERATIONS.COMMENT, {
            parent_author: "",
            parent_permlink: tags[0] || 'steepshot',
            author: author,
            permlink: permlink + '-post',
            title: title,
            description: description,
            body: file,
            json_metadata: JSON.stringify(this._createJsonMetadata(tags))
        }];
        const callbackBc = (err, success) => {
            if(err) {
                callback(err, null);
                console.log(err);
            } else
            if (success) {
                const data = JSON.stringify({
                    username : author
                });
                logPost(data);
                callback(null, success);
            }
        };
        this.handleBroadcastMessages(operation, [], wif, callbackBc);
    }

    handleBroadcastMessages(message, extetion, postingKey, callback) {
        let self = this;
        this._preCompileTransaction(message, postingKey)
        .then((response) => {
            if (response.ok) {
                response.json().then((result) => {
                    let beneficiaries = self._getBeneficiaries(message[1].permlink, result.beneficiaries);
                    message[1].body = result.payload.body;
                    result.meta.tags = [...JSON.parse(message[1].json_metadata).tags, ...result.meta.tags];
                    message[1].json_metadata = JSON.stringify({...result.meta});
                    const operations = [message, beneficiaries];
                    steem.broadcast.sendAsync(
                        { operations, extensions: [] },
                        { posting: postingKey }, callback
                    );
                });
            } else {
                response.json().then((result) => {
                    callback(result.username[0]);
                });
            };
        });
    }

    _preCompileTransaction(message, postingKey) {
        return steem.broadcast._prepareTransaction({
            extensions: [],
            operations: [message],
        })
        .then((transaction) => {
            return Promise.join(
                transaction,
                steem.auth.signTransaction(transaction, [postingKey])
            )
        })
        .spread((transaction, signedTransaction) => {
            return preparePost(message, signedTransaction);
        });
    }

    _createJsonMetadata(tags) {
      if (tags.length == 0) tags.push('steepshot');
        return {
            tags: tags,
            app: 'steepshot/0.0.6' //@TODO get metadata from Backend
        }
    }

    _getPermLink() {
        return new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
    }
}

export default new Steem();
