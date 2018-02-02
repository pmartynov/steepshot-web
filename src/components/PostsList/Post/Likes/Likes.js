import React from 'react';
import {connect} from 'react-redux';
import ShowIf from '../../../Common/ShowIf';

class Likes extends React.Component {
  constructor(props) {
    super(props);
  }

  openLikesModal() {
    this.props.dispatch({ type : 'CLEAR_LIKES_INFO', url : this.props.url });
    jqApp.openLikesModal($(document));
  }

  render() {
    return (
      <ShowIf show={this.props.likes !== 0}>
        <div className="container_likes" onClick={this.openLikesModal.bind(this)}>
          {this.props.likes} {this.props.likes> 1 ? 'likes' : 'like'}
        </div>
      </ShowIf>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    likes: state.posts[props.postIndex].net_likes,
    url: state.posts[props.postIndex].url
  };
};

export default connect(mapStateToProps)(Likes);
