import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import TimeAgo from 'timeago-react';
import Flag from './Flag/Flag';
import ShowIf from '../../Common/ShowIf';
import PostContextMenu from '../../PostContextMenu/PostContextMenu';
import {UserLinkFunc} from '../../Common/UserLinkFunc';
import constants from '../../../common/constants';
import Tags from './Tags/Tags';
import Vote from './Vote/Vote';
import PostModal from '../../PostModal/PostModal';
import {openPostModal} from '../../../actions/postModal';
import LoadingSpinner from '../../LoadingSpinner/index';
import Avatar from '../../Common/Avatar/Avatar';
import Likes from './Likes/Likes';

class Post extends React.Component {

  static defaultProps = {
    clearPostHeader: false,
  };

  constructor(props) {
    super(props);
  }

  openPostModal() {
    let modalOption = {
      body: (<PostModal/>)
    };
    this.props.openModal(this.props.point, this.props.index, modalOption);
  }

  commentNumber() {
    if (this.props.children) {
      let text;
      if (this.props.children === 1) {
        text = 'comment';
      } else {
        text = 'comments';
      }
      return (
        <p>{`${this.props.children} ${text}`}</p>
      );
    } else {
      return (
        <p style={{color: '#979b9e'}}>Post your comment</p>
      );
    }
  }

  render() {
    if (!this.props || !this.props.imgUrl) {
      return null;
    }
    let itemImage = this.props.imgUrl || constants.NO_IMAGE;
    let authorImage = this.props.avatar || constants.NO_AVATAR;

    const authorLink = `/@${this.props.author}`;
    const cardPhotoStyles = {
      backgroundImage: 'url(' + itemImage + ')',
    };
    return (
      <div className="item-wrap">
        <div className="post-card" style={{position: 'relative'}}>
          <ShowIf show={this.props.postDeleting}>
            <div className="delete-loader_post"
                 style={{height: this.props.clearPostHeader ? '512px' : '552px'}}
            >
              <LoadingSpinner style={{position: 'absolute'}} loaderClass='deleting-loader'/>
            </div>
          </ShowIf>
          <ShowIf show={!this.props.clearPostHeader}>
            <div className="card-head clearfix">
              <div className="date">
                <TimeAgo
                  datetime={this.props.created}
                  locale='en_US'
                  style={{float: 'left'}}
                />
                <PostContextMenu style={{float: 'right', height: '22px', width: '22px', marginLeft: '10px'}}
                                 className="post-context-menu_post"
                                 item={this.props}
                                 index={this.props.index}
                />
              </div>
              <Link to={authorLink} className="user">
                <div className="photo">
                  <Avatar src={authorImage}/>
                </div>
                <div className="name">{this.props.author}</div>
              </Link>
            </div>
          </ShowIf>
          <div className="card-body">
            <div className="card-pic" onClick={this.openPostModal.bind(this)}>
              <ShowIf show={this.props.is_nsfw}>
                <div className="forAdult">
                  <p>NSFW content</p>
                </div>
              </ShowIf>
              <ShowIf show={!this.props.is_nsfw && this.props.is_low_rated}>
                <div className="forAdult">
                  <p>Low rated content</p>
                </div>
              </ShowIf>
              <a style={cardPhotoStyles} className="img"/>
            </div>
            <div className="card-wrap">
              <div className="card-controls clearfix">
                <div className="buttons-row">
                  <Vote postIndex={this.props.index}/>
                  <ShowIf show={this.props.authUser !== this.props.author}>
                    <Flag postIndex={this.props.index}/>
                  </ShowIf>
                </div>
                <div className="wrap-counts clearfix">
                  <Likes postIndex={this.props.index}/>
                  <ShowIf show={parseFloat(this.props.total_payout_reward).toFixed(2) !== 0}>
                    <div className="amount">${this.props.total_payout_reward}</div>
                  </ShowIf>
                </div>
              </div>
              <div className="card-preview">
                {UserLinkFunc(null, this.props.title)}
                <Tags tags={this.props.tags}/>
              </div>
              <div className="number-of-comments_post" onClick={this.openPostModal.bind(this)}>
                {this.commentNumber()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const media = state.posts[props.index].media[0];
  let imgUrl = media['thumbnails'] ? media['thumbnails']['1024'] : media.url;
  return {
    ...state.posts[props.index],
    imgUrl,
    authUser: state.auth.user
  }
    ;
};

const mapDispatchToProps = (dispatch) => {
  return {
    openModal: (point, index, options) => {
      dispatch(openPostModal(point, index, options));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Post);
