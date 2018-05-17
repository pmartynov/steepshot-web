import React from 'react';
import {connect} from 'react-redux';
import {addSinglePost} from '../../actions/post';
import PostModal from '../PostModal/PostModal';
import './singlePost.css';
import {withWrapper} from "create-react-server/wrapper";
import {addMetaTags, getTags} from "../../actions/metaTags";
import {utils} from "../../utils/utils";
import LoggingService from "../../services/loggingService";
import PostService from "../../services/postService";

class SinglePost extends React.Component {

	static async getInitialProps({location, req, res, store}) {
		await store.dispatch(addSinglePost(location.pathname));
		if (!req || !store || !location) {
			return {};
		}
		const post = utils.getFirstObjectField(store.getState().posts);
		await store.dispatch(addMetaTags(getTags(post.title, req.hostname + location.pathname, post.media[0].url)));
		return {};
	}

	componentDidMount() {
		if (!Object.keys(this.props.post).length) {
			this.props.addSinglePost(this.props.history.location.pathname)
		}
		let username = this.props.location.pathname.match(/\/@[\w-.]+\//)[0];
		LoggingService.logSharePost(username.replace(/\/@([\w-.]+)\//, '$1'),
			PostService.getPermlinkFromUrl(this.props.location.pathname));
	}

	render() {
		if (global.isServerSide) {
			return null;
		}
		let itemPost;
		if (Object.keys(this.props.post).length !== 0) {
			itemPost = this.props.post[Object.keys(this.props.post)[0]];
			document.title = `@${itemPost.author}: «${itemPost.title}» | Steepshot`;
		}

		if (!this.props.currentIndex) return null;
		return (
			<div className="container_sin-pos">
				<div className="to-center_sin-pos">
					<PostModal showClose={false} singlePost={true}/>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		...state.postModal,
		post: {...state.posts}
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		addSinglePost: url => {
			dispatch(addSinglePost(url));
		},
	};
};

export default withWrapper(connect(mapStateToProps, mapDispatchToProps)(SinglePost));
