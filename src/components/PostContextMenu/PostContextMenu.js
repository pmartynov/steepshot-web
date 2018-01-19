import * as React from 'react';
import PostMenuButton from './OpenMenuButton/PostMenuButton';
import Modal from '../Common/Modal/Modal';
import Menu from './Menu/Menu';
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import {toggleFlag} from '../../actions/flag';
import {copyToClipboard} from '../../actions/clipboard';
import {deletePost} from '../../actions/post';

const MIN_BUTTON_WIDTH = 90;
const MAX_BUTTON_SIZE = 100;
const CONTENT_PADDING = 20;
const CONTENT_MARGIN = 40;
const MAX_HORIZONTAL_CONTENT_WIDTH = 200;

class PostContextMenu extends React.Component {

  constructor(props) {
    super(props);
    let buttonsOptions = this.setButtonsOptions.call(this);
    let buttonsAmount = buttonsOptions.length;

    let minContentWidth = buttonsAmount * MIN_BUTTON_WIDTH + 2 *
      (CONTENT_PADDING + CONTENT_MARGIN);
    let maxContentWidth = buttonsAmount * MAX_BUTTON_SIZE + 2 *
      (CONTENT_PADDING + CONTENT_MARGIN);

    this.state = {
      showModal: false,
      fullScreen: false,
      contentWidth: minContentWidth,
      contentHeight: MAX_BUTTON_SIZE,
      MAX_CONTENT_WIDTH: maxContentWidth,
      MIN_CONTENT_WIDTH: minContentWidth,
      BUTTONS_AMOUNT: buttonsAmount,
      BUTTONS_OPTIONS: buttonsOptions,
    };
    this.closeFunc = this.closeFunc.bind(this);
    this.openFunc = this.openFunc.bind(this);
    this.resizeWindow = this.resizeWindow.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeWindow);
    this.resizeWindow();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeWindow);
  }

  resizeWindow() {
    if (document.documentElement.clientWidth > this.state.MAX_CONTENT_WIDTH) {
      if (this.state.contentWidth !== this.state.MAX_CONTENT_WIDTH) {
        this.setState({
          fullScreen: false,
          contentWidth: MAX_BUTTON_SIZE * this.state.BUTTONS_AMOUNT + 'px',
          contentHeight: MAX_BUTTON_SIZE + 'px',
        });
      }
    } else if (document.documentElement.clientWidth < this.state.MIN_CONTENT_WIDTH) {
      let contentWidth = document.documentElement.clientWidth -
        (CONTENT_MARGIN) * 2;
      if (contentWidth > MAX_HORIZONTAL_CONTENT_WIDTH) {
        contentWidth = MAX_HORIZONTAL_CONTENT_WIDTH;
      }
      this.setState({
        fullScreen: true,
        contentWidth: contentWidth + 'px',
        contentHeight: 'auto',
      });
    } else {
      let contentWidth = document.documentElement.clientWidth -
        (CONTENT_MARGIN + CONTENT_PADDING) * 2;
      this.setState({
        fullScreen: false,
        contentWidth: contentWidth + 'px',
        contentHeight: contentWidth / this.state.BUTTONS_AMOUNT + 'px',
      });
    }
  }

  hidePost() {

  }

  deletePost() {
    this.props.deletePost(this.props.index);
    this.closeFunc();
  }

  editPost() {

  }

  share() {

  }

  copyLink() {
    let url = document.location.origin + '/post' + this.props.item.url;
    this.props.copyToClipboard(url);
    this.closeFunc();
  }

  embed() {

  }

  toggleFlag() {
    this.props.toggleFlag(this.props.index);
    this.closeFunc();
  }

  closeFunc() {
    this.setState({
      showModal: false,
    });
  }

  openFunc() {
    this.setState({
      showModal: true,
    });
  }

  render() {
    return (
      <div className="container_pos-con-men" style={this.props.style}>
        <PostMenuButton openFunc={this.openFunc} style={this.props.style}/>
        <Modal
          show={this.state.showModal}
          closeFunc={this.closeFunc}
          fullScreen={false}
          closeButton={false}
          styles={'container_mod'}
        >
          <Menu buttonOption={this.state.BUTTONS_OPTIONS}
                fullScreen={this.state.fullScreen}
                closeFunc={this.closeFunc}
                contentWidth={this.state.contentWidth}
                contentHeight={this.state.contentHeight}/>
        </Modal>
      </div>
    );
  }

  setButtonsOptions() {
    let BUTTONS_OPTIONS = [
      /*TODO uncomment when will be implemented share
      {
        img: '/static/images/postContextMenu/shareTrue.svg',
        revertImg: '/static/images/postContextMenu/shareFalse.svg',
        alt: 'Share',
        callback: this.share.bind(this),
        hasDelimiter: true,
      }, */{
        img: '/static/images/postContextMenu/copyTrue.svg',
        revertImg: '/static/images/postContextMenu/copyFalse.svg',
        alt: 'Copy link',
        callback: this.copyLink.bind(this),
        hasDelimiter: false,
      },
      /* TODO uncomment when will be implemented embed
      {
        img: '/static/images/postContextMenu/embedTrue.svg',
        revertImg: '/static/images/postContextMenu/embedFalse.svg',
        alt: 'Embed',
        callback: this.embed.bind(this),
        hasDelimiter: false,
      },*/
    ];

    let tmp;
    if (this.props.item.author == this.props.username) {
      tmp = [
        {
          img: '/static/images/postContextMenu/deleteTrue.svg',
          revertImg: '/static/images/postContextMenu/deleteFalse.svg',
          alt: 'Delete',
          callback: this.deletePost.bind(this),
          hasDelimiter: true,
        }
      /* TODO uncomment when will be implemented edit post
        {
          img: '/static/images/postContextMenu/editTrue.svg',
          revertImg: '/static/images/postContextMenu/editFalse.svg',
          alt: 'Edit',
          callback: this.editPost.bind(this),
          hasDelimiter: true,
        }*/
      ];
    } else {
      tmp = [
        {
          img: '/static/images/flagTrue.svg',
          revertImg: '/static/images/flagFalse.svg',
          alt: 'Flag this',
          callback: this.toggleFlag.bind(this),
          hasDelimiter: true,
        }, /* TODO uncomment when will be implemented delete
        {
          img: '/static/images/postContextMenu/hideTrue.svg',
          revertImg: '/static/images/postContextMenu/hideFalse.svg',
          alt: 'Hide',
          callback: this.hidePost.bind(this),
          hasDelimiter: true,
        }*/];
    }
    return tmp.concat(BUTTONS_OPTIONS);
  }

}


const mapStateToProps = (state) => {
  return {
    localization: state.localization,
    username: state.auth.user,
    postingKey: state.auth.postingKey
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleFlag: (postIndex) => {
      dispatch(toggleFlag(postIndex));
    },
    copyToClipboard: (text) => {
      dispatch(copyToClipboard(text));
    },
    deletePost: (postIndex) => {
      dispatch(deletePost(postIndex));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(PostContextMenu);
