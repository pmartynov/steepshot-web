import React from 'react';
import Modal from 'react-modal';
import {
  Link,
  Redirect
} from 'react-router-dom';
import {
  getPostComments
} from '../../actions/posts';
import ReactResizeDetector from 'react-resize-detector';
import {
  connect
} from 'react-redux';
import PropTypes from 'prop-types';
import Comments from './Comments';
import constants from '../../common/constants';
import VouteComponent from './VouteComponent';
import FlagComponent from './FlagComponent';
import TagComponent from './TagComponent';
import LikesComponent from './LikesComponent';
import TimeAgo from 'timeago-react';

class Item extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: this.props.item,
      items: this.props.items,
      openModal: this.props.openModal,
      currentIndex: this.props.index,
      comments: [],
      redirectToReferrer: false,
      needsRenderSlider: true,
      clearPropsHeader: this.props.clearPostHeader
    };

    this.localConstants = {
       THIS_POST_MODAL_REF : "thisPostModal" + this.props.index
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps == this.props && nextState == this.state) return false;
    return true;
  }

  componentDidMount() {
    let propsItem = this.state.item;

    propsItem.total_payout_reward = '$' + parseFloat(propsItem.total_payout_reward).toFixed(2);

    propsItem.tags = (propsItem.tags instanceof Array) ? propsItem.tags : propsItem.tags.split(',');

    for (let i = 0; i < propsItem.tags.length; i++) {
      propsItem.tags[i] = '#' + propsItem.tags[i];
    }

    this.setState({
      item: propsItem,
      avatar: propsItem.avatar,
      image: propsItem.body
    });
  }

  resetDefaultProperties(newItem) {
    this.setState({
      avatar: newItem.avatar,
      image: newItem.body,
      item: newItem
    });
  }

  redirectToUserProfile() {
    this.setState({ redirectToReferrer: true });
  }

  setDefaultAvatar() {
    this.setState({ avatar: constants.NO_AVATAR });
  }

  setDefaultImage() {
    this.setState({ image: constants.NO_IMAGE });
  }

  callPreventDefault(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  _getPostImageStyles(itemImage) {
    return {
      backgroundImage: `url(${itemImage})`,
      backgroundPosition: 'fixed',
      backgroundRepeat: 'no-repeat',
      backgroundOrigin: 'center',
      backgroundClip: 'content-box',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }

  _openModal() {
    if (this.state.openModal != undefined) {
      this.state.openModal(this.state.currentIndex)
    }
  }

  renderTags() {
    if (this.state.item.tags) {
      return this.state.item.tags.map((tag, index) => {
        return <span key={index}><TagComponent tag={tag}/> </span>
      });
    } else return null;
  }


  render() {
    let _this = this;
    let itemImage = this.state.image || constants.NO_IMAGE;
    let authorImage = this.state.avatar || constants.NO_AVATAR;
    let comments = <Comments key="comments" item={this.state.item} />;

    const authorLink = `/@${this.state.item.author}`;
    const cardPhotoStyles = {
      backgroundImage : 'url(' + itemImage + ')'
    };

    return (
      <div className="item-wrap">
        <div className="post-card" >
          {
            !this.state.clearPropsHeader
              ?
              <div className="card-head clearfix">
                <div className="date">
                  <TimeAgo
                    datetime={this.state.item.created}
                    locale='en_US'
                  />
                </div>
                <Link to={authorLink} className="user">
                  <div className="photo">
                    <img src={authorImage} alt="User" onError={this.setDefaultAvatar.bind(this)}/>
                  </div>
                  <div className="name">{this.state.item.author}</div>
                </Link>
              </div>
              :
              null
          }

          <div className="card-body">
            <div className="card-pic" onClick={this._openModal.bind(this)}>
                <a style={ cardPhotoStyles } className="img" alt="User" onError={this.setDefaultImage.bind(this)}></a>
              </div>
            <div className="card-wrap">
              <div className="card-controls clearfix">
                <div className="buttons-row" onClick={(e)=>{this.callPreventDefault(e)}}>
                  <VouteComponent key="vote"
                    item={this.state.item}
                    index={this.state.currentIndex}
                    updateVoteInComponent={this.props.updateVoteInComponent}
                    parent='post'
                  />
                  <FlagComponent
                    key="flag"
                    item={this.state.item}
                    index={this.state.currentIndex}
                    updateFlagInComponent={this.props.updateFlagInComponent}
                  />
                </div>
                <div className="wrap-counts clearfix">
                  <LikesComponent likes={this.state.item.net_votes} url={this.state.item.url}/>
                  <div className="amount">{this.state.item.total_payout_reward}</div>
                </div>
              </div>
              <div className="card-preview">
                {this.state.item.title + ' '}
                {this.renderTags()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Item.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number
};

const mapStateToProps = (state) => {
  return {
    localization: state.localization
  };
};

export default connect(mapStateToProps)(Item);
