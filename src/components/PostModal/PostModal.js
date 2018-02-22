import React from 'react';
import {connect} from 'react-redux';
import {nextPostModal, previousPostModal, setPostModalOptions} from '../../actions/postModal';
import constants from '../../common/constants';
import TimeAgo from 'timeago-react';
import {Link} from 'react-router-dom';
import Avatar from '../Common/Avatar/Avatar';
import {closeModal} from '../../actions/modal';
import ShowIf from '../Common/ShowIf';
import Flag from '../PostsList/Post/Flag/Flag';
import Vote from '../PostsList/Post/Vote/Vote';
import {UserLinkFunc} from '../Common/UserLinkFunc';
import Tags from '../PostsList/Post/Tags/Tags';
import ScrollViewComponent from '../Common/ScrollViewComponent';
import Comments from '../Posts/Comments';
import LoadingSpinner from '../LoadingSpinner/index';
import {sendComment} from '../../actions/comment';
import {copyToClipboard} from '../../actions/clipboard';
import ReactDOM from 'react-dom';
import PostContextMenu from "../PostContextMenu/PostContextMenu";
import Likes from "../PostsList/Post/Likes/Likes";
import utils from '../../utils/utils';

const START_TEXTAREA_HEIGHT = '42px';

class PostModal extends React.Component {

  static defaultProps = {
    showClose: true,
  };

  constructor(props) {
    super(props);
    this.setComponentSize = this.setComponentSize.bind(this);
    this.initKeyPress();
  }

  componentDidMount() {
    window.addEventListener('resize', this.setComponentSize);
    this.setComponentSize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setComponentSize);
  }

  componentDidUpdate(nextProps) {
    if (!this.props.needsCommentFormLoader && nextProps.needsCommentFormLoader) {
      setTimeout(() => {
        this.scrollAfterComment();
      }, 250);
    }
  }

  scrollAfterComment() {
    this.textArea.value = '';
    this.changeText();
    this.scrollView.scrollBar.scrollToBottom();
  }

  openDescription() {
    this.props.setPostModalOptions({isDescriptionOpened: true});
  }

  previousPost() {
    this.props.previous(this.props.currentIndex);
    this.clearTextArea();
  }

  nextPost() {
    this.props.next(this.props.currentIndex);
    this.clearTextArea();
  }

  initKeyPress() {
    document.onkeydown = (e) => {
      if (document.activeElement !== ReactDOM.findDOMNode(this.textArea)) {
        switch (e.keyCode) {
          case 37:
            this.previousPost();
            break;
          case 39:
            this.nextPost();
            break;
          default :
            break;
        }
      }
    };
  }

  clearTextArea() {
    this.textArea.value = '';
    this.hiddenDiv.textContent = '';
    this.textArea.style.height = '42px';
    this.setComponentSize();
  }

  renderImage() {
    let imgUrl = this.props.imgUrl || this.props.media.url || constants.NO_IMAGE;
    return (
      <div className="image-container_pos-mod"
           style={this.props.style.imgCont}>
        <ShowIf show={this.props.post.is_nsfw && !this.props.showAll}>
          <div className="curtain_pos-mod">
            <p className="title_pos-mod">NSFW content</p>
            <p className="message_pos-mod">This content is for adults only.
              Not
              recommended for children or sensitive individuals.</p>
            <button className="btn btn-index"
                    onClick={
                      () => this.props.setPostModalOptions({showAll: true})
                    }>Show me
            </button>
          </div>
        </ShowIf>
        <ShowIf show={this.props.post.is_low_rated && !this.props.showAll && !this.props.post.is_nsfw}>
          <div className="curtain_pos-mod">
            <p className="title_pos-mod">Low rated content</p>
            <p className="message_pos-mod">This content is hidden due to low ratings.</p>
            <button className="btn btn-index"
                    onClick={
                      () => this.props.setPostModalOptions({showAll: true})
                    }>Show me
            </button>
          </div>
        </ShowIf>
        <button className="btn btn-default btn-xs"
                onClick={() => this.props.copyToClipboard(
                  document.location.origin + '/post' + this.props.post.url.replace(/\/\w+/, ''),
                )}>Copy link
        </button>
        <img src={imgUrl}
             alt="Post picture."
             style={this.props.style.image}
             ref={ref => this.image = ref}
             onLoad={this.imageLoaded.bind(this)}
             onError={this.loadImgError.bind(this)}/>
        <ShowIf show={!this.image || !this.image.complete}>
          <div className="before-load-curtain_pos-mod">
            <LoadingSpinner/>
          </div>
        </ShowIf>
        <ShowIf show={this.image && this.image.complete && !this.image.naturalWidth}>
          <div className="before-load-curtain_pos-mod">
            <p className="title_pos-mod">Sorry, image isn't found.</p>
          </div>
        </ShowIf>
      </div>);
  }

  renderDescription() {
    let forceOpen = false;
    let descriptionStart = this.props.post.description.replace(/(<\w+>)+/, '');
    if (descriptionStart.replace(/\n[\w\W]+/, '').length < 140) {
      forceOpen = true;
    }

    return (
      <div className="text-description_pos-menu">
        <p>{UserLinkFunc(true, this.props.post.title)}</p>
        <div
          className={(this.props.isDescriptionOpened || forceOpen)
            ? 'collapse-opened'
            : 'collapse-closed'}
        >

          {UserLinkFunc(false, this.props.post.description)}
          <Tags tags={this.props.post.tags}/>
          <a className="lnk-more" onClick={this.openDescription.bind(this)}>Show
            more</a>
        </div>
      </div>);
  }

  imageLoaded() {
    this.setComponentSize();
  }

  loadImgError() {
    this.setComponentSize();
  }

  changeText() {
    this.hiddenDiv.textContent = this.textArea.value + '\n';

    let label = '';
    let sendHover = '';
    if (this.textArea.value) {
      label = 'focused_pos-mod';
      sendHover = 'btn-hover_pos-mod';
    }
    if (this.hiddenDiv.clientHeight >= this.props.style.textareaMarginTop) {
      return;
    }
    let delta = this.props.addCommentHeight - this.hiddenDiv.clientHeight || 0;
    if (!this.props.addCommentHeight || delta >= 5 || delta <= -5 || this.textArea.value.length <= 1) {
      this.props.setPostModalOptions({
        addCommentHeight: this.hiddenDiv.clientHeight,
        label,
        sendHover,
      });
    }
  }

  sendComment(e) {
    e.preventDefault();
    let comment = this.textArea.value;
    if (comment === '') return false;
    this.props.sendComment(this.props.currentIndex, comment);
    this.textArea.value = '';
    this.changeText();
  }

  render() {
    const authorLink = `/@${this.props.post.author}`;
    return (
      <div className="container_pos-mod" style={this.props.style.container}>
        <ShowIf show={this.props.showClose}>
          <ShowIf show={this.props.postList.posts[0] !== this.props.currentIndex}>
            <div className="arrow-left-modal_post-mod" onClick={this.previousPost.bind(this)}>
              <i className="far fa-arrow-alt-circle-left fa-2x"/>
            </div>
          </ShowIf>
          <ShowIf show={this.props.post.url !== this.props.postList.offset}>
            <div className="arrow-right-modal_post-mod" onClick={this.nextPost.bind(this)}>
              <i className="far fa-arrow-alt-circle-right fa-2x"/>
            </div>
          </ShowIf>
        </ShowIf>
        {this.renderImage.bind(this)()}
        <div className="header_pos-mod"
             style={this.props.style.headerCont}
        >
          <div className="date_pos-mod">
            <TimeAgo datetime={this.props.post.created}
                     locale='en_US'
                     className="time_pos-mod"
            />
            <PostContextMenu style={{height: '22px', width: '22px', marginRight: this.props.showClose ? '38px' : 0}}
                             className="post-context-menu_post"
                             item={this.props.post}
                             index={this.props.currentIndex}
            />
            <ShowIf show={this.props.showClose}>
              <div className="cont-close-btn_pos-mod" onClick={() => this.props.closeModal(this.props.point)}>
                <i className="close-btn_pos-mod"/>
              </div>
            </ShowIf>
          </div>
          <Link to={authorLink} className="user_pos-mod">
            <Avatar src={this.props.post.avatar}/>
            <div className="name_pos-mod">
              {this.props.post.author}
            </div>
          </Link>
        </div>

        <div className="description_pos-mod"
             style={this.props.style.description}
             ref={(ref) => {this.descPosMod = ref}}
        >
          <div className="control-cont_pos-mod">
            <div className="post-control_pos-mod">
              <div className="likes_pos-mod">
                <Likes postIndex={this.props.currentIndex}/>
              </div>
              <div className="amount_pos-mod">
                <ShowIf show={parseFloat(this.props.post.total_payout_reward)}>
                  <div>
                    ${this.props.post.total_payout_reward}
                  </div>
                </ShowIf>
              </div>
              <ShowIf show={this.props.authUser !== this.props.post.author}>
                <div className="button_pos-mod">
                  <Flag postIndex={this.props.currentIndex}/>
                </div>
              </ShowIf>
              <div className="button_pos-mod">
                <Vote postIndex={this.props.currentIndex}/>
              </div>
            </div>
          </div>

          <div className="comment-container_pos-mod">
            <ScrollViewComponent
              ref={(ref) => this.scrollView = ref}
              wrapperModifier="list-scroll_pos-mod"
              scrollViewModifier="list-scroll-view_pos-mod"
              autoHeight={window.innerWidth <
              constants.DISPLAY.DESK_BREAKPOINT}
              autoHeightMax={350}
              autoHeightMin={100}
              autoHide={true}
            >
              {this.renderDescription.bind(this)()}
              <Comments
                key="comments"
                item={this.props.post}
                newComment={this.props.newComment}
                replyUser={this.textArea}
              />
            </ScrollViewComponent>
          </div>

          <ShowIf show={this.props.isUserAuth}>
            <div className="add-comment_pos-mod">
              <div className="hidden-div_pos-mod"
                   ref={ref => {
                     this.hiddenDiv = ref
                   }}
                   style={this.textArea ? {width: this.textArea.clientWidth, maxHeight: 480} : {}}
              />
              <textarea ref={ref => this.textArea = ref}
                        maxLength={2048}
                        className="form-control text-area_pos-mod"
                        onChange={this.changeText.bind(this)}
                        style={{
                          height: this.hiddenDiv !== undefined
                            ? this.props.addCommentHeight + 'px'
                            : START_TEXTAREA_HEIGHT,
                        }}
              />
              <label className={this.props.label + ' label_pos-mod'}>Comment</label>
              <ShowIf show={this.props.needsCommentFormLoader}>
                <LoadingSpinner style={{top: 0}}/>
              </ShowIf>
              <ShowIf show={!this.props.needsCommentFormLoader}>
                <button type="submit"
                        className={'btn-submit' + ' ' + 'btn_pos-mod' + ' ' + this.props.sendHover}
                        onClick={this.sendComment.bind(this)}
                >Send
                </button>
              </ShowIf>
            </div>
          </ShowIf>
        </div>
      </div>
    );
  }

  setComponentSize() {
    const DESC_WIDTH = 380;
    const MIN_HEIGHT = 440;
    const MAX_WIDTH_FULL_SCREEN = 815;

    const docWidth = document.documentElement.clientWidth;
    const docHeight = document.documentElement.clientHeight;
    const MAX_IMG_WIDTH = (docWidth - DESC_WIDTH) * 0.8;
    const PREFERRED_IMG_WIDTH = 640;
    const container = {};
    container.width = docWidth;
    container.height = '100%';

    const textareaMarginTop = this.descPosMod.clientHeight - 220;

    const image = {};
    image.width = this.image.naturalWidth;
    image.height = this.image.naturalHeight || docHeight * 0.4;
    const imgCont = {};
    imgCont.width = '100%';
    const headerCont = {};
    headerCont.width = '100%';
    const description = {};

    if (docWidth > MAX_WIDTH_FULL_SCREEN) {
      image.width = image.width || utils.getLess((docWidth - DESC_WIDTH) * 0.8, PREFERRED_IMG_WIDTH);
      container.height = utils.getMore(docHeight * 0.9, MIN_HEIGHT);

      if (image.height > container.height) {
        image.width = image.width * container.height / image.height;
        image.height = container.height;
      }

      if (image.width > MAX_IMG_WIDTH) {
        image.height = image.height * MAX_IMG_WIDTH / image.width;
        image.width = MAX_IMG_WIDTH;
      }

      container.width = image.width + DESC_WIDTH;
      imgCont.width = image.width;
      headerCont.width = DESC_WIDTH;

      container.height = utils.getMore(image.height, MIN_HEIGHT);
    } else {
      image.width = utils.getLess(image.width, document.documentElement.clientWidth);
      image.width = image.width || docWidth;
      image.height = image.height * image.width / this.image.naturalWidth;
    }

    description.width = headerCont.width;
    let style = {
      container,
      image,
      imgCont,
      headerCont,
      description,
      textareaMarginTop
    };
    if (JSON.stringify(style) !== JSON.stringify(this.props.style)) {
      this.props.setPostModalOptions({style});
    }
  }
}

const mapStateToProps = (state) => {
  let post = state.posts[state.postModal.currentIndex];
  let media = post.media[0];
  let imgUrl;
  if (document.documentElement.clientWidth <= 1024 && media['thumbnails'] && media['thumbnails']['1024']) {
    imgUrl = media['thumbnails']['1024'];
  }
  return {
    postList: state.postsList[state.postModal.point],
    ...state.postModal,
    post,
    media,
    imgUrl,
    isUserAuth: state.auth.user && state.auth.postingKey,
    authUser: state.auth.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setPostModalOptions: options => {
      dispatch(setPostModalOptions(options));
    },
    closeModal: (point) => {
      dispatch(closeModal(point));
    },
    sendComment: (index, comment) => {
      dispatch(sendComment(index, comment));
    },
    copyToClipboard: (text) => {
      dispatch(copyToClipboard(text));
    },
    next: (index) => {
      dispatch(nextPostModal(index));
    },
    previous: (index) => {
      dispatch(previousPostModal(index));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PostModal);
