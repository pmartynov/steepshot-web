import React from 'react';
import {connect} from 'react-redux';
import Constants from '../../common/constants';
import Avatar from '../Common/Avatar/Avatar';
import PostsList from '../PostsList/PostsList';
import UsersList from '../UsersList/UsersList';
import {withWrapper} from 'create-react-server/wrapper';
import {addMetaTags, getDefaultTags} from '../../actions/metaTags';
import {push, replace} from 'react-router-redux';
import TabsBar from '../Common/TabsBar/TabsBar';
import Tab from '../Common/TabsBar/Tab/Tab';
import {getUserProfile} from '../../actions/userProfile';
import ShowIf from '../Common/ShowIf';
import LoadingSpinner from '../LoadingSpinner';
import './userProfile.css';
import {setActiveIndex} from '../../actions/tabsBar';
import Follow from '../Follow/Follow';
import AuthService from '../../services/AuthService';
import renderHTML from 'react-render-html';
import MarkdownParser from '../../utils/markdownParser';

class UserProfile extends React.Component {

	static async getInitialProps({location, req, res, store}) {
		if (!req || !location || !store) {
			return {};
		}
		await store.dispatch(addMetaTags(getDefaultTags(req.hostname, location.pathname)));
		return {};
	}

	constructor(props) {
		super();
		props.getUserProfile(props.username);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.username !== this.props.username) {
			this.props.getUserProfile(nextProps.username);
			this.props.setActiveIndex("userProfile", 0);
		}
	}

	render() {
		if (global.isServerSide) {
			return null;
		}
		if (this.props.loading || !this.props.profile) {
			return (
				<div className="con-spi_use-pro">
					<LoadingSpinner/>
				</div>);
		}

		let name = this.props.profile.name || `@${this.props.profile.username}`;
		let website = this.props.profile['website'];
		let location = this.props.profile.location;
		let balance = this.props.profile['estimated_balance'];
		let avatarSrc = this.props.profile['profile_image'] || Constants.NO_AVATAR;
		return (
			<div className="container">
				<div className="g-content col-xs-12 clearfix" id="workspace">
					<div className="row">
						<div className="col-xs-12 col-md-4 col-lg-3">
							<div className="user-information">
								<div className="pic-wrap clearfix">
									<Avatar src={avatarSrc}
									        powerIndicator={this.props.isYourProfile}
									        sizes={Constants.USER_PROFILE_AVATAR_SIZE}
									/>
									<ShowIf show={!this.props.isYourProfile && this.props.isAuth}>
										<Follow/>
									</ShowIf>
								</div>
								<div className="name">{name}</div>
								<div className="location">{location}</div>
								<p
									className="word-wrap_brake-word">{renderHTML(MarkdownParser.parseTitle(this.props.profile.about))}</p>
								<p className="break--word">
									<a className="website_use-pro" href={website} target="_blank">{website}</a>
								</p>
								<div className="amount">
									<div className="balance_use-pro">$ {balance}</div>
									<ShowIf show={this.props.isYourProfile}>
										<div className="description">This is the current amount of
											funds in your account in the
											application.
										</div>
									</ShowIf>
									<ShowIf show={!this.props.isYourProfile}>
										<div className="description">This is the current amount of
											funds in user account in the
											application.
										</div>
									</ShowIf>
								</div>
							</div>
						</div>
						<div className="col-xs-12 col-md-8 col-lg-9 position--unset">
							<TabsBar point="userProfile" showLoader={false}>
								<Tab name={this.props.profile['post_count'] + ' ' + Constants.POSTS_FILTERS.POSTS_USER.label}>
									<PostsList
										point={insertUsername(Constants.POSTS_FILTERS.POSTS_USER.point, this.props.username)}
										wrapperModifier="posts-list clearfix type-2"
										clearPostHeader={true}
										isComponentVisible={this.props.activeIndex === 0}
									/>
								</Tab>
								<Tab name={this.props.profile['following_count'] + ' ' + Constants.USERS_FILTERS.FOLLOWING.label}>
									<UsersList
										point={insertUsername(Constants.USERS_FILTERS.FOLLOWING.point, this.props.username)}
										className="posts-list clearfix type-2"
										isComponentVisible={this.props.activeIndex === 1}
									/>
								</Tab>
								<Tab name={this.props.profile['followers_count'] + ' ' + Constants.USERS_FILTERS.FOLLOWERS.label}>
									<UsersList
										point={insertUsername(Constants.USERS_FILTERS.FOLLOWERS.point, this.props.username)}
										className="posts-list clearfix type-2"
										isComponentVisible={this.props.activeIndex === 2}
									/>
								</Tab>
							</TabsBar>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	const watcher = state.auth.user;
	const username = props.match.params.username || watcher;

	const location = state.router.location || props.location || {};
	return {
		username,
		isAuth: AuthService.isAuth(),
		profile: state.userProfile.profile,
		loading: state.userProfile.loading,
		pathname: location.pathname,
		isYourProfile: watcher === username,
		watcher,
		activeIndex: state.tabsBar.userProfile.activeIndex
	};
};

function insertUsername(point, userName) {
	if (userName === undefined) return point;
	let path = point.split('/');
	return `${path[0]}/${userName}/${path[1]}`;
}

const mapDispatchToProps = (dispatch) => {
	return {
		historyPush: (path) => {
			dispatch(push(path))
		},
		historyReplace: (newPath) => {
			dispatch(replace(newPath))
		},
		getUserProfile: (userName) => {
			dispatch(getUserProfile(userName));
		},
		setActiveIndex: (point, index) => {
			dispatch(setActiveIndex(point, index));
		}
	}
};

export default withWrapper(connect(mapStateToProps, mapDispatchToProps)(UserProfile));
