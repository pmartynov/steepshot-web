import React from 'react';
import {connect} from 'react-redux';
import {getPostsList, initPostsList} from '../../actions/postsList';
import {debounce} from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import LoadingSpinner from '../LoadingSpinner';
import Post from './Post/Post';
import HeadingLeadComponent from '../Atoms/HeadingLeadComponent';
import './postsList.css';
import {utils} from "../../utils/utils";
import Constants from "../../common/constants";

class PostsList extends React.Component {
	static defaultProps = {
		maxPosts: 9999,
		clearPostHeader: false,
		isComponentVisible: true,
		headerText: ''
	};

	constructor(props) {
		super(props);
		let postsListOptions = {
			point: props.point,
			options: props.options,
			maxPosts: props.maxPosts,
			loading: false,
			posts: [],
			length: 0,
			hasMore: true
		};
		props.initPostsList(postsListOptions);
	}

	componentDidMount() {
		this.props.getPosts(this.props.point);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.point !== this.props.point) {
			let postsListOptions = {
				point: nextProps.point,
				options: nextProps.options,
				maxPosts: nextProps.maxPosts,
				loading: false,
				posts: [],
				length: 0,
				hasMore: true,
			};
			this.props.initPostsList(postsListOptions);
			this.props.getPosts(nextProps.point);
		}
	}

	shouldComponentUpdate(nextProps) {
		if (utils.equalsObjects(nextProps, this.props)) {
			return false;
		}
		return true;
	}

	renderPosts() {
		if (!this.props.length && !this.props.loading) {
			let warningMessage = Constants.EMPTY_QUERY;
			if (this.props.errorMessage) {
				warningMessage = this.props.errorMessage;
			}
			return (
				<div className="empty-query-message">
					{warningMessage}
				</div>
			);
		}
		let posts = [];
		this.props.posts.forEach((postIndex, index) => {
			if (this.props.ignored.indexOf(postIndex) === -1) {
				posts.push(<Post key={index}
												 index={postIndex}
												 point={this.props.point}
												 clearPostHeader={this.props.clearPostHeader}
				/>);
			}
		});
		return posts;
	}

	renderHeader() {
		if (this.props.headerText) return (
			<HeadingLeadComponent text={this.props.headerText}/>
		);
		return null;
	}

	getPostsList() {
		if (this.props.isComponentVisible) {
			this.props.getPosts(this.props.point)
		}
	}

	render() {
		return (
			<div className={this.props.className}>
				{this.renderHeader()}
				<InfiniteScroll
					pageStart={0}
					initialLoad={false}
					loadMore={debounce(this.getPostsList.bind(this), Constants.ENDLESS_SCROLL.DEBOUNCE)}
					hasMore={this.props.isComponentVisible && this.props.hasMore}
					loader={
						<div className='spinner_pos-lis' key={this.props.point}>
							<LoadingSpinner/>
						</div>}
					threshold={Constants.ENDLESS_SCROLL.OFFSET}
				>
					<div className={this.props.wrapperModifier}>
						{this.renderPosts()}
					</div>
				</InfiniteScroll>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	return {
		...state.postsList[props.point],
		point: props.point,
		ignored: state.postsList[props.ignored] ? state.postsList[props.ignored].posts : []
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		initPostsList: (options) => {
			dispatch(initPostsList(options));
		},
		getPosts: (point) => {
			dispatch(getPostsList(point));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(PostsList);
