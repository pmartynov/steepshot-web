import React from 'react';
import {connect} from 'react-redux';
import ShowIf from '../../Common/ShowIf';
import TextInput from '../../Common/TextInput/TextInput';
import {editComment, sendComment, setCommentEditState} from '../../../actions/comments';
import LoadingSpinner from '../../LoadingSpinner';
import Utils from '../../../utils/Utils';
import './commentInput.css';
import Constants from '../../../common/constants';
import AuthService from '../../../services/AuthService';

class CommentInput extends React.Component {

	componentWillUnmount() {
		if (this.props.commentEditing) {
			this.props.setCommentEditState('', this.props.point, false);
		}
	}

	sendComment(isEdit) {
		if (!this.props.canSent) return;
		if (!isEdit) {
			this.props.sendComment(this.props.point, Constants.TEXT_INPUT_POINT.COMMENT);
		} else {
			this.props.editComment(this.props.point, this.props.editingPostPoint, Constants.TEXT_INPUT_POINT.COMMENT);
		}
	}

	render() {
		let buttonState = <button type="submit"
		                          className={'btn_com-inp ' + (this.props.canSent ? 'btn-act_com-inp' : '')}
		                          onClick={this.sendComment.bind(this, false)}> Send
		</button>;
		if (this.props.commentEditing) {
			buttonState = <button type="submit"
			                      className={'btn_com-inp ' + (this.props.canSent ? 'btn-act_com-inp' : '')}
			                      onClick={this.sendComment.bind(this, true)}> Edit
			</button>;
		}
		return (
			<ShowIf show={this.props.isAuth}>
				<div className="container_com-inp">
					<TextInput title="Comment"
					           point={Constants.TEXT_INPUT_POINT.COMMENT}
					           multiline={true}
					           smallFont={true}
					           maxHeight={100}
					           disabled={this.props.sendingNewComment}
					/>
					<ShowIf show={!this.props.sendingNewComment}>
						{buttonState}
					</ShowIf>
					<ShowIf show={this.props.sendingNewComment}>
						<LoadingSpinner style={{marginBottom: 4}}/>
					</ShowIf>
				</div>
			</ShowIf>
		)
	}
}

const mapStateToProps = (state, props) => {
	let commentValue = state.textInput, commentBody = '';
	let textInputData = state.textInput[Constants.TEXT_INPUT_POINT.COMMENT];
	let newCommentText = textInputData ? textInputData.text : null;
	let editingPostPoint = state.comments[props.point].editingPostPoint;
	if (editingPostPoint) {
		commentBody = state.posts[editingPostPoint].body;
	}
	return {
		isAuth: AuthService.isAuth(),
		...state.comments[props.point],
		commentValue,
		canSent: textInputData && Utils.isNotEmptyString(textInputData.text) && commentBody !== newCommentText
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		sendComment: (postIndex, point) => {
			dispatch(sendComment(postIndex, point));
		},
		editComment: (parentPost, postIndex, point) => {
			dispatch(editComment(parentPost, postIndex, point));
		},
		setCommentEditState: (point, parentPost, commentEditing) => {
			dispatch(setCommentEditState(point, parentPost, commentEditing));
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentInput);
