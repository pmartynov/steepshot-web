import * as React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {closeModal} from '../../../actions/modal';
import {editPostReject, editPostRequest, editPostSuccess} from '../../../actions/editPost';
import constants from '../../../common/constants';
import {push} from "react-router-redux";
import './plagiarismTracking.css';
import {pushMessage} from "../../../actions/pushMessage";
import PostService from "../../../services/postService";

class PlagiarismTracking extends React.Component {

	renderImage() {
		let image = {
			background: `#f4f4f6 url('${this.props.data.media.thumbnails[1024]}') center no-repeat`,
			backgroundSize: 'contain'
		};
		return (
			<div className="image_plag-track" style={image}/>
		)
	}

	closeModal() {
		this.props.closeModal('PlagiarismTrackingModal');
	}

	continuePublishing() {
		let data = this.props.data;
		PostService.afterCheckingPlagiarism(data.operations)
			.then(() => {
				this.props.pushMessage(constants.POST_SUCCESSFULLY_CREATED);
				this.props.editPostSuccess();
				this.props.historyPush(`/@${this.props.authUser}`);
			})
			.catch(error => {
				this.props.editPostReject(error);
				this.props.pushMessage(error.message);
			});
		this.props.closeModal('PlagiarismTrackingModal');
		this.props.editPostRequest();
	}

	plagiarismAuthor() {
		let plagiator = this.props.data.plagiarism_author;
		if (this.props.authUser === plagiator) {
			return (
				<span>you. We do not recommend you to re-upload photos
					as it may result in low payouts and reputation loss.</span>
			)
		}
		let linkToPlagUser = `/@${plagiator}`;
		return (
			<span>
				<Link to={linkToPlagUser} target="_blank"> @{plagiator}</Link>. We do not recommend you to upload other
				users' photos as it may result in low payouts and reputation loss.
			</span>
		)
	}

	plagiarismSubText() {
		let plagiator = this.props.data.plagiarism_author;
		let linkToPlagPhoto = `/post/@${plagiator}/${this.props.data.plagiarism_permlink}`;
		if (this.props.authUser === plagiator) {
			return ''
		}
		return (
			<p className="sub-descrip_plag-track">If you're sure that you are the author of the photo, please flag and/or
				leave a comment under the
				<Link to={linkToPlagPhoto} target="_blank"> photo </Link>
				to let other people know they should flag this post.</p>
		)
	}

	render() {
		return (
			<div className="wrapper_plag-track">
				<div className="title-wrapper_plag-track">
					<p className="title_plag-track">PLAGIARISM CHECK</p>
					<p>
						<Link to="/guide" target="_blank">Guidelines</Link>
					</p>
				</div>
				{this.renderImage()}
				<p className="descrip_plag-track">We have found a
					<Link to={`/post/@${this.props.data.plagiarism_author}/${this.props.data.plagiarism_permlink}`}
								target="_blank"> similar photo</Link> in Steepshot, uploaded by {this.plagiarismAuthor()}
				</p>
				{this.plagiarismSubText()}
				<p className="guidelines_plag-track">
					<a href={`https://steepshot.org/ipfs/${this.props.data.ipfs}`} target="_blank">IPFS link</a>
				</p>
				<div className="buttons_plag-track">
					<button className="btn btn-index" onClick={this.closeModal.bind(this)}>NO, CANCEL PUBLISHING</button>
					<button className="btn btn-default" onClick={this.continuePublishing.bind(this)}>YES, CONTINUE PUBLISHING
					</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	return {
		...props,
		authUser: state.auth.user
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		closeModal: (index) => {
			dispatch(closeModal(index));
		},
		editPostRequest: () => {
			dispatch(editPostRequest());
		},
		editPostSuccess: () => {
			dispatch(editPostSuccess());
		},
		editPostReject: (error) => {
			dispatch(editPostReject(error));
		},
		historyPush: (path) => {
			dispatch(push(path))
		},
		pushMessage: (message) => {
			dispatch(pushMessage(message))
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(PlagiarismTracking);
