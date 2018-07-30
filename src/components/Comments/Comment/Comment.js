import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import TimeAgo from 'timeago-react';
import Avatar from '../../Common/Avatar/Avatar';
import {replyAuthor, setCommentEditState, setInputForEdit} from '../../../actions/comments';
import Likes from '../../PostsList/Post/Likes/Likes';
import './comment.css';
import Vote from '../../PostsList/Post/Vote/Vote';
import Flag from '../../PostsList/Post/Flag/Flag';
import {deletePost} from '../../../actions/post';
import ShowIf from '../../Common/ShowIf';
import Constants from '../../../common/constants';
import {loadingEllipsis} from '../../../utils/loadingEllipsis';
import MarkdownParser from '../../../utils/markdownParser';
import renderHTML from 'react-render-html';

class Comment extends React.Component {

	editComment() {
		this.props.setInputForEdit(this.props.point, this.props.parentPost, true);
	}

	replyToUser() {
		if (this.props.isCommentEditing) {
			return;
		}
		this.props.replyAuthor(this.props.author);
	}

	deleteComment() {
		if (this.props.isCommentEditing) {
			return;
		}
		this.props.deleteComment(this.props.point, true);
	}

	cancelEdit() {
		this.props.setCommentEditState('', this.props.parentPost, false);
	}

	render() {
		if (!this.props.comment) {
			return null;
		}
		let deleteCommentElement = <span className="delete_comment"
		                                 onClick={this.deleteComment.bind(this)}>Delete
															 </span>;
		let editCommentElement = <span className="edit_comment"
		                               onClick={this.editComment.bind(this)}>Edit
														 </span>;
		if (this.props.comment.postDeleting) {
			deleteCommentElement = loadingEllipsis('Deleting', 'not-hover_comment');
		}

		if (this.props.isCommentCancelable) {
			editCommentElement = <span className="edit_comment"
			                           onClick={this.cancelEdit.bind(this)}>Cancel
													 </span>;
		}

		let money = this.props.comment.total_payout_reward > 0 ?
			<span className="money_comment">{`$${this.props.comment.total_payout_reward}`}</span> : null;
		let commentActions = !this.props.isYourComment
			? <div className="display--flex">
			    <span className="reply_comment"
			          onClick={this.replyToUser.bind(this)}>Reply</span>
				<Flag postIndex={this.props.point}
				      isComment={true}/>
			</div>
			: <div className="display--flex">
				<ShowIf show={!this.props.commentDeleted && !this.props.cashoutTimeExceed}
				        styleContainer={{display: 'flex'}}>
					{editCommentElement}
					{deleteCommentElement}
				</ShowIf>
			</div>;
		const authorLink = `/@${this.props.author}`;
		return (
			<div className="container_comment" style={{
				backgroundColor: this.props.currentCommentEditing
					? 'rgba(18, 148, 246, 0.05)' : ''
			}}>
				<div className="head_comment">
					<div className="date">
						<TimeAgo
							datetime={this.props.comment.created}
							locale='en_US'
						/>
					</div>
					<Link to={authorLink} className="user">
						<Avatar src={this.props.comment.avatar} sizes={Constants.DEF_AVATAR_SIZE}/>
						<div className="name">{this.props.author}</div>
					</Link>
				</div>
				<div className="comment-text">
					<div className="comment-text_comment">
						{renderHTML(MarkdownParser.parse(this.props.comment.body))}
					</div>
					<Vote postIndex={this.props.point}
					      powerLikeIndPlace="comment"
					      commentDeleted={this.props.commentDeleted}/>
				</div>
				<div className="actions-buttons_comment">
					{commentActions}
					<div className="display--flex">
						<Likes postIndex={this.props.comment.url} commentAuthor={authorLink}/>
						{money}
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	let comment = state.posts[props.point];
	const commentDeleted = comment.body === '*deleted*';
	const cashoutTimeExceed = new Date(comment.cashout_time) < new Date();
	const parentPost = props.point.replace(/(.+)#.+/, '$1');
	const currentCommentEditing = props.point === state.comments[parentPost].editingPostPoint;
	const isCommentEditing = state.comments[parentPost].commentEditing;
	const isCommentCancelable = props.point === state.comments[parentPost].editingPostPoint;
	return {
		comment,
		currentCommentEditing,
		isCommentCancelable,
		isCommentEditing,
		parentPost,
		commentDeleted,
		cashoutTimeExceed,
		author: comment.author,
		isYourComment: comment.author === state.auth.user
	};
};

const mapDispatchToProps = dispatch => {
	return {
		replyAuthor: (name) => {
			dispatch(replyAuthor(name));
		},
		deleteComment: (point, isComment) => {
			dispatch(deletePost(point, isComment))
		},
		setInputForEdit: (point, parentPost, currentCommentEditing) => {
			dispatch(setInputForEdit(point, parentPost, currentCommentEditing))
		},
		setCommentEditState: (point, parentPost, commentEditing) => {
			dispatch(setCommentEditState(point, parentPost, commentEditing));
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Comment);
