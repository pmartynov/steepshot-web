import React from 'react';
import ReactDOM from 'react-dom';
import Steem from '../../libs/steem';
import {
  Link,
  Redirect
} from 'react-router-dom';
import {
  connect
} from 'react-redux';
import Comments from './Comments';
import PropTypes from 'prop-types';
import constants from '../../common/constants';
import VouteComponent from './VouteComponent';
import AddComment from './AddComment';
import FlagComponent from './FlagComponent';
import ShareComponent from './ShareComponent';
import LoadingSpinner from '../LoadingSpinner';
import ScrollViewComponent from '../Common/ScrollViewComponent';
import TagComponent from './TagComponent';
import AvatarComponent from '../Atoms/AvatarComponent';
import LikesComponent from './LikesComponent';
import TimeAgo from 'timeago-react';
import {Collapse} from 'react-collapse';
import Constants from '../../common/constants';

import utils from '../../utils/utils';

class ItemModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            avatar : this.props.item.avatar,
            item : this.props.item,
            index : this.props.index,
            initialIndex : this.props.index,
            image : this.props.item.body,
            items : this.props.items,
            comments : [],
            disableNext : false,
            disablePrev : false,
            redirectToReferrer : false,
            commentValue : '',
            needsCommentFormLoader : false,
            isLoading : false,
            hasMore : this.props.hasMore,
            loadMore : this.props.loadMore
        };

        this.initKeypress();
    }

    needMore() {
      if (this.state.isLoading || !this.state.hasMore) return false;
      const curIndex = this.state.index;
      if (curIndex + 7 >= this.state.items.length) {
          this.setState({
            isLoading : true
          }, () => {
            this.state.loadMore();
          });
      }
    }

    clearNewComment(callback) {
      this.setState({
        newComment : null
      }, () => callback ? callback() : false);
    }

    componentWillReceiveProps(nextProps){
      let isLoading = this.state.isLoading;
      if (isLoading)
      if (this.state.items != nextProps.items) {
        isLoading = false;
      }
      this.setState({
        item : nextProps.index == this.state.initialIndex ? this.state.item : nextProps.item,
        items : nextProps.items,
        index: nextProps.index == this.state.initialIndex ? this.state.index : nextProps.index,
        initialIndex : nextProps.index,
        comments : [],
        disableNext : false,
        disablePrev : false,
        redirectToReferrer : false,
        newComment : null,
        isLoading : isLoading
      }, () => {
        this.needMore();
      });
    }

    componentDidMount() {
      this.needMore(this.props);
      setTimeout(() => {
        jqApp.forms.init();
      }, 0);
    }

    sendComment(e) {
      e.preventDefault();

      if (this.state.commentValue == "") return false;

      const urlObject = this.state.item.url.split('/');

      const callback = (err, success) => {
        this.setState({
          needsCommentFormLoader : false
        });
        if (err) {
          jqApp.pushMessage.open(err);
        } else
        if (success) {
            this.setState({
              newComment : {
                net_votes : 0,
                vote : false,
                avatar : this.props.avatar,
                author : this.props.username,
                total_payout_value : 0,
                body : this.state.commentValue,
                created : Date.now()
              },
              commentValue : ''
            }, () => {
              this.scrollView.scrollBar.scrollToBottom();
              jqApp.pushMessage.open(Constants.COMMENT_SUCCESS_MESSAGE);
            });
        }
      }

      this.setState({
        needsCommentFormLoader : true
      }, () => {
        Steem.comment(
          this.props.postingKey,
          this.state.item.author,
          urlObject[urlObject.length - 1],
          this.props.username,
          this.state.commentValue,
          this.state.item.tags,
          callback
        );
      });
    }

    initKeypress() {
      document.onkeydown = (e) => {
        if (document.activeElement !== ReactDOM.findDOMNode(this.refs.commentInput))
        switch (e.keyCode) {
            case 37:
                this.previous();
                break;
            case 39:
                this.next();
                break;
            default :
                break;
        }
      };
    }

    setDefaultImage() {
      this.setState({
        image: constants.NO_IMAGE
      });
    }

    commentChanged(event) {
      this.setState({
          commentValue : event.target.value
      });
    }

    next() {
      this.needMore();
      if (this.state.index < this.state.items.length - 1) {
          this.clearNewComment(this.resetDefaultProperties(this.state.items[this.state.index + 1], 1));
      }
    }

    redirectToLoginPage() {
      this.props.history.push('/signin');
    }

    resetDefaultProperties(newItem, indexUpdater) {
      this.setState({
          item: newItem,
          index: this.state.index + indexUpdater
      });
    }

    previous() {
      if (this.state.index > 0) {
          this.clearNewComment(this.resetDefaultProperties(this.state.items[this.state.index - 1], -1));
      }
    }

    callPreventDefault(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    openDescription() {
      this.setState({isDescriptionOpened : true});
    }

    shouldComponentUpdate(nextProps,nextState) {
      if (this.state.index != nextState.index)
      if (this.state.isDescriptionOpened) this.setState({ isDescriptionOpened : false });
      return true;
    }

    renderDescription() {
      let text = this.state.item.description;
      let forceOpen = false;
      this.state.item.tags.map(tag => text = text + ' #' + tag);
      if (text.length < 140) forceOpen = true;
      return (
        <div className="post-description">
          <p>{this.state.item.title}</p>
          <div
            className={(this.state.isDescriptionOpened || forceOpen) ? "collapse-opened" : "collapse-closed"}
          >
              {this.state.item.description + ' '}
              {
                this.state.item.tags.map((tag, index) => {
                  return <span key={index}><TagComponent tag={tag}/> </span>
                })
              }
              <a className="lnk-more" onClick={this.openDescription.bind(this)}>Show more</a>
          </div>
          <p></p>
        </div>
      )
    }

    render() {

      let _this = this;
      let itemImage = this.state.item.body || constants.NO_IMAGE;
      let isUserAuth = (this.props.username && this.props.postingKey);

      const authorLink = `/@${this.state.item.author}`;

      return(
        <div>
          <div className="post-single">
            <div className="post-wrap post">
              <div className="post__image-container position--relative">
                <ShareComponent
                    url={this.state.item.url}
                    title="Share post"
                    containerModifier="block--right-top box--small post__share-button"
                />
                <img src={itemImage}
                  alt="Post picture."
                />
              </div>
              <div className="post__description-container">
                <div className="post-header">
                  <div className="user-wrap clearfix">
                    <div className="date">
                      <TimeAgo
                        datetime={this.state.item.created}
                        locale='en_US'
                      />
                    </div>
                    <Link to={authorLink} className="user">
                      <AvatarComponent src={this.state.item.avatar} />
                      <div className="name">{this.state.item.author}</div>
                    </Link>
                  </div>
                </div>
                <div className="post-controls clearfix">
                  <div className="buttons-row" onClick={(e)=>{this.callPreventDefault(e)}}>
                    <VouteComponent
                      key="vote"
                      item={this.state.item}
                      index={this.state.index}
                      updateVoteInComponent={this.props.updateVoteInComponent}
                      parent='post'
                    />
                    <FlagComponent
                      key="flag"
                      item={this.state.item}
                      index={this.state.index}
                      updateFlagInComponent={this.props.updateFlagInComponent}
                    />
                  </div>
                  <div className="wrap-counts clearfix">
                    <LikesComponent likes={this.state.item.net_votes} url={this.state.item.url}/>
                    <div className="amount">
                      {utils.currencyChecker(this.state.item.total_payout_reward)}
                    </div>
                  </div>
                </div>
                <ScrollViewComponent
                  ref={(ref) => this.scrollView = ref}
                  wrapperModifier="list-scroll"
                  scrollViewModifier="list-scroll__view"
                  autoHeight={window.innerWidth < constants.DISPLAY.DESK_BREAKPOINT}
                  autoHeightMax={350}
                  autoHeightMin={100}
                  autoHide={true}
                >
                  {this.renderDescription()}
                  <Comments key="comments" item={this.state.item} newComment={this.state.newComment}/>
                </ScrollViewComponent>
                {
                  isUserAuth
                  ?
                    <div className="post-comment">
                      <div className="comment-form form-horizontal">
                        <div className="form-group clearfix">
                          {
                            this.state.needsCommentFormLoader
                            ?
                              <div className="loaderInComments">
                                <LoadingSpinner />
                              </div>
                              :
                              <div className="btn-wrap">
                                <button type="submit" className="btn-submit" onClick={this.sendComment.bind(this)}>Send</button>
                              </div>
                          }
                          <div className="input-container">
                            <textarea
                              ref="commentInput"
                              id="formCOMMENT"
                              name="commentValue"
                              value={this.state.commentValue}
                              maxLength={2048}
                              className="form-control"
                              onChange={this.commentChanged.bind(this)}
                            />
                            <label htmlFor="formCOMMENT" className="name">Comment</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  :
                    null
                }
              </div>
            </div>
          </div>
        </div>
      );
    }
}

ItemModal.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
};

const mapStateToProps = (state) => {
  return {
    localization: state.localization,
    username: state.auth.user,
    postingKey: state.auth.postingKey,
    avatar: state.auth.avatar
  };
};

export default connect(mapStateToProps)(ItemModal);
