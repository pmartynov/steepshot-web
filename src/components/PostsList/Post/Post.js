import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import TimeAgo from 'timeago-react';
import Flag from './Flag/Flag';
import ShowIf from '../../Common/ShowIf';
import PostContextMenu from '../../PostContextMenu/PostContextMenu';
import Constants from '../../../common/constants';
import Tags from './Tags/Tags';
import Vote from './Vote/Vote';
import PostModal from '../../PostModal/PostModal';
import {openPostModal} from '../../../actions/postModal';
import {playVideo, setPowerLikeInd, setPowerLikeTimeout, setVideoTime, stopVideo} from '../../../actions/post';
import LoadingSpinner from '../../LoadingSpinner/index';
import Avatar from '../../Common/Avatar/Avatar';
import Likes from './Likes/Likes';
import './post.css';
import ReactPlayer from 'react-player';
import MarkdownParser from '../../../utils/markdownParser';
import renderHTML from 'react-render-html';
import ImagesService from '../../../services/ImagesService';
import PostImgBackground from './PostImgBackground';
import ChainService from '../../../services/ChainService';

class Post extends React.Component {

	static defaultProps = {
		clearPostHeader: false,
	};

	constructor(props) {
		super(props);
		if (this.props.imageUrl && this.props.imageUrl !== Constants.NO_IMAGE) {
			ImagesService.getImagesWithProxy(this.props.imageUrl,
				`https://steemitimages.com/${2 * Constants.DEF_POST_SIZE}x${2 * Constants.DEF_POST_SIZE}/`);
		}
	}

	openPostModal() {
		let modalOption = {
			body: (<PostModal/>)
		};
		this.props.openModal(this.props.point, this.props.index, modalOption);
	}

	blockLinkToSinglePost() {
		return (
			<Link to={this.props.linkToSinglePost}
			      target="_blank"
			      className="open-in-new-tab_post"
			      onClick={(e) => Post.preventModalForNewTab(e)}/>
		)
	}

	static preventModalForNewTab(e) {
		if (e.ctrlKey || e.metaKey) {
			e.stopPropagation();
			return true;
		}
		let event = e ? e : window.event;
		(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
		return false;
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


	stopVideoPlaying() {
		this.props.stopVideo(this.props.index);
		this.player.seekTo(0);
	}

	renderImage() {
		if (this.props.isVideo) {
			return (
				<div className="video-cont-wrap_vid-con">
					<div className="card-pic post_vid-con" onClick={this.openPostModal.bind(this)}
					     onMouseEnter={() => this.props.playVideo(this.props.index)}
					     onMouseLeave={this.stopVideoPlaying.bind(this)}
					>
						{this.blockLinkToSinglePost()}
						<ShowIf show={!this.props.playing}>
							<div className="video-time-indicator_post">
								{this.props.time || '00.00'}
							</div>
							<div className="video-indicator_post"/>
						</ShowIf>
						<ReactPlayer
							url={this.props.imageUrl}
							height='100%'
							loop={true}
							playing={this.props.playing}
							controls={false}
							ref={ref => this.player = ref}
							onDuration={time => this.props.setVideoTime(this.props.index, time)}
						/>
					</div>
				</div>
			)
		}
		return (
			<div className="card-pic" onClick={this.openPostModal.bind(this)}>
				{this.blockLinkToSinglePost()}
				<ShowIf show={this.props.isGallery}>
					<div className="gallery-indicator_post"/>
				</ShowIf>
				<ShowIf show={this.props.isGif}>
					<div className="gif-indicator_post"/>
				</ShowIf>
				<ShowIf show={this.props['is_nsfw']}>
					<div className="forAdult">
						<p>NSFW content</p>
					</div>
				</ShowIf>
				<ShowIf show={!this.props.is_nsfw && this.props.is_low_rated}>
					<div className="forAdult">
						<p>Low rated content</p>
					</div>
				</ShowIf>
				<PostImgBackground src={this.props.imageUrl} sizes={Constants.DEF_POST_SIZE}/>
			</div>
		)
	}

	render() {
		if (!this.props || !this.props.imageUrl) {
			return null;
		}
		let avatarSrc = this.props.avatar || Constants.NO_AVATAR;

		const authorLink = `/@${this.props.author}`;

		return (
			<div className="item-wrap" id={this.props.index}>
				<div className="post-card position--relative">
					<ShowIf show={this.props.postDeleting}>
						<div className="delete-loader_post"
						     style={{height: this.props.clearPostHeader ? '496px' : '536px'}}
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
									style={{float: 'left'}}/>
								<PostContextMenu style={{float: 'right', height: '22px', width: '22px', marginLeft: '10px'}}
								                 className="post-context-menu_post"
								                 item={this.props}
								                 index={this.props.index}/>
							</div>
							<Link to={authorLink} className="user">
								<div className="photo">
									<Avatar src={avatarSrc} sizes={Constants.DEF_AVATAR_SIZE}/>
								</div>
								<div className="name">{this.props.author}</div>
							</Link>
						</div>
					</ShowIf>
					<div className="card-body">
						{this.renderImage()}
						<div className="card-wrap_post">
							<div className="card-controls_post">
								<Likes postIndex={this.props.index} style={{paddingLeft: 20}}/>
								<div className="card-buttons_post">
									<ShowIf show={parseFloat(this.props.total_payout_reward)}>
										<div className="amount">${this.props.total_payout_reward}</div>
									</ShowIf>
									<ShowIf show={this.props.authUser !== this.props.author}>
										<Flag postIndex={this.props.index}/>
									</ShowIf>
									<div className="position--relative">
										<div className="card-control-stop"/>
										<Vote postIndex={this.props.index}
										      powerLikeIndPlace="post"/>
									</div>
								</div>
							</div>
							<div className="card-preview_post">
								{renderHTML(MarkdownParser.parseTitle(this.props.title))}
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
	let post = state.posts[props.index];
	let isGolosService = ChainService.usingGolos();
	if (post) {
		const media = post.media[0];
		let linkToSinglePost = (isGolosService ? '/' + Constants.SERVICES.golos.name : '')
			+ '/post' + post.url.replace(/\/[\w-.]+/, '');
		let isGallery = false;
		if (post.media.length > 1) {
			isGallery = true;
		}
		let imageUrl = media.url || Constants.NO_IMAGE;
		return {
			...post,
			imageUrl,
			isGallery,
			linkToSinglePost,
			authUser: state.auth.user
		};
	} else {
		return {}
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		openModal: (point, index, options) => {
			dispatch(openPostModal(point, index, options));
		},
		setPowerLikeInd: (index, isOpen, place) => {
			dispatch(setPowerLikeInd(index, isOpen, place));
		},
		setPowerLikeTimeout: (index, plTimeout) => {
			dispatch(setPowerLikeTimeout(index, plTimeout));
		},
		playVideo: (index) => {
			dispatch(playVideo(index))
		},
		stopVideo: (index) => {
			dispatch(stopVideo(index))
		},
		setVideoTime: (index, time) => {
			dispatch(setVideoTime(index, time))
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Post);