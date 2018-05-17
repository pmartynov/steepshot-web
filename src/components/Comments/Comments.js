import React from 'react';
import Comment from './Comment/Comment';
import {connect} from 'react-redux';
import LoadingSpinner from '../LoadingSpinner';
import ShowIf from "../Common/ShowIf";
import {getPostComments, initPostComment} from "../../actions/comments";
import Description from "./Description/Description";
import CommentInput from "./CommentInput/CommentInput";
import {Scrollbars} from "react-custom-scrollbars";
import './comments.css';

class Comments extends React.Component {

	constructor(props) {
		super();
		props.initPostComment(props.point);
		props.getComments(props.point);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.point !== this.props.point) {
			nextProps.getComments(nextProps.point);
		}
		if (nextProps.scrollToLastComment !== this.props.scrollToLastComment && this.scrollBar) {
			this.scrollBar.scrollToTop();
		}
		return true;
	}

	renderScrollbarContainer() {
		return <div className='list-scroll-view_comments'/>
	}

	render() {
		const isMobile = document.documentElement.clientWidth < 815;
		let comments = null, propsComments = this.props.comments;

		if (this.props.loading && (!propsComments || !propsComments.length)) {
			comments = <LoadingSpinner style={{marginTop: 20}}/>;
		}
		if (propsComments && propsComments.length > 0) {
			comments = [];
			for (let i = 0; i < propsComments.length; i++) {
        comments.unshift(<Comment key={i} point={propsComments[i]}/>);
			}
		}
		return (
			<div className="container_comments">
				<div className="container-small-screen_comments">
					<Scrollbars
						ref={ref => this.scrollBar = ref}
						renderView={this.renderScrollbarContainer.bind(this)}
						autoHeight={true}
						autoHeightMin={100}
						autoHeightMax={15000}
					>
						<Description
							title={this.props.post.title}
							tags={this.props.post.tags}
							description={this.props.post.description}
						/>
						<ShowIf show={isMobile}>
							<CommentInput point={this.props.point}/>
						</ShowIf>
						<div className="list_comments">
							{comments}
						</div>
					</Scrollbars>
				</div>
				<ShowIf show={!isMobile} className='comment-input-big-screen'>
					<CommentInput point={this.props.point}/>
				</ShowIf>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	return {
		isUserAuth: state.auth.user && state.auth.postingKey,
		post: state.posts[props.point],
		...state.comments[props.point]
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getComments: (point) => {
			dispatch(getPostComments(point))
		},
		initPostComment: (point) => {
			dispatch(initPostComment(point));
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Comments);
