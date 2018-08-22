import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {logout, setUserAuth, updateVotingPower} from '../../actions/auth';
import Constants from '../../common/constants';
import Avatar from '../Common/Avatar/Avatar';
import {setSearchPanelState, setSearchValue} from '../../actions/search';
import {closeMobileNavigation, toggleMobileNavigation} from '../../actions/mobileNavigation';
import Hamburger from '../Hamburger/Hamburger';
import './header.css';
import AuthService from '../../services/AuthService';
import ShowIf from '../Common/ShowIf';

class Header extends React.Component {

	constructor(props) {
		super();
		if (!global.isServerSide) {
			props.setUserAuth();
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.isOpened) {
			this.searchInput.focus();
		}
	}

	handleLogout(event) {
		event.preventDefault();
		this.props.logout();
	}

	searchKeyPress(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (e.target.value === '') {
				return;
			}
			this.props.historyPush(`/search/${this.props.searchValue}`);
			if (this.props.openedMobileNavigation) {
				this.props.closeMobileNavigation();
			}
		}
	}

	searchHandleChange(e) {
		let value = e.target.value.toLowerCase();
		this.props.setSearchValue(value.replace(/[^[a-zA-Zа-яА-Я0-9-.]/g, ''));
	}

	render() {
		if (global.isServerSide) {
			return <div className="block-in-body_header" key="Header"/>;
		}
		const isAuth = this.props.isAuth;
		let browse, authorLink = '';

		let loginComponent = <div className="section login">
													 <div className="wrap-login">
														 <Link to="/signin" className="btn btn-default btn-xs">
															 SIGN IN
														 </Link>
													 </div>
												 </div>;
		if (isAuth) {
			authorLink = `/@${this.props.user}`;
			loginComponent = <div className="section controls">
				<div className="wrap-controls_header">
					<Link to="/wallet" className="btn-control wallet"/>
					<Link to="/settings" className="btn-control settings"/>
					<a onClick={this.handleLogout.bind(this)}
					   className="btn-control logout"> </a>
				</div>
			</div>;
		}

		browse = <div className="section menu">
			<div>
				{
					(isAuth) ? (
						<div className="item feed-block_header">
							<Link to="/feed"
							      className={this.props.currentLocation.match(/\/feed/) ? 'feed-browse-active_header' : null}>Feed
							</Link>
						</div>
					) : null
				}
				<div className="item browse-block_header">
					<Link to="/browse"
					      className={this.props.currentLocation.match(/\/browse\/\w+/) ? 'feed-browse-active_header' : null}>Browse
					</Link>
				</div>
			</div>
		</div>;

		return (
			<div className="block-in-body_header" key="Header">
				<header className="g-header">
					<div className="container">
						<div className={'user-panel ' + (this.props.isOpened ? 'closed' : 'open')}>
							<div className="wrap-panel clearfix">
								<ShowIf show={isAuth}>
									<div className="section hamburger">
										<div className="wrap-hamburger">
											<Hamburger toggle={this.props.toggleMobileNavigation}
											           pressed={this.props.openedMobileNavigation}/>
										</div>
									</div>
								</ShowIf>
								{loginComponent}
								<div className="section create">
									<ShowIf show={isAuth}>
										<Link to="/editPost" type="button" className="btn btn-default btn-xs btn-create">
											CREATE POST
										</Link>
									</ShowIf>
								</div>
								<div className="section user">
									{
										this.props.user
											? <Link to={authorLink} className="user-link clearfix">
												<div className="photo">
													<Avatar src={this.props.avatar}
													        powerIndicator={true}
													        headerAvatar={true}
													        sizes={Constants.DEF_AVATAR_SIZE}
													/>
												</div>
												<div className="name">{this.props.user}</div>
											</Link>
											: null
									}
								</div>
								<div className="section logo">
									<a href="/" className="wrap-logo">
										<img src="/images/steepshotLogo@2x.svg" alt="logo"/>
									</a>
								</div>
								<div className="section search">
									<div className="wrap-search" onClick={() => this.props.setSearchPanelState(true)}>
										<span className="lnk-search">Search</span>
										<span className="search-mob-ico_search"> </span>
									</div>
								</div>
								{browse}
							</div>
						</div>
						<div className={'search-panel ' + (this.props.isOpened ? 'open' : 'closed')}>
							<div className="wrap-panel container clearfix">
								<div className="wrap-btn">
									<button type="button" className="btn-close" onClick={() => {
										this.props.setSearchValue("");
										this.props.setSearchPanelState(false);
									}}/>
								</div>
								<div className="wrap-search">
									<form className="form-search">
										<input
											type="text"
											name="search"
											value={this.props.searchValue}
											ref={ref => this.searchInput = ref}
											onChange={this.searchHandleChange.bind(this)}
											required={true}
											placeholder={
												this.props.sizeParam
													? Constants.SEARCH_PLACEHOLDER_MIN
													: Constants.SEARCH_PLACEHOLDER
											}
											className="input-search"
											onKeyPress={this.searchKeyPress.bind(this)}
										/>
									</form>
								</div>
							</div>
						</div>
					</div>
				</header>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	const location = state.router.location || props.location || {};
	return {
		sizeParam: state.window.width < 420,
		isAuth: AuthService.isAuth(),
		user: state.auth.user,
		avatar: state.auth.avatar,
		searchValue: state.search.value,
		isOpened: state.search.isOpened,
		currentLocation: location.pathname,
		openedMobileNavigation: state.mobileNavigation.opened
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => {
			dispatch(logout())
		},
		updateVotingPower: (username) => {
			dispatch(updateVotingPower(username));
		},
		setUserAuth: () => {
			dispatch(setUserAuth());
		},
		setSearchValue: (value) => {
			dispatch(setSearchValue(value));
		},
		historyPush: (path) => {
			dispatch(push(path));
		},
		setSearchPanelState: (flag) => {
			dispatch(setSearchPanelState(flag));
		},
		closeMobileNavigation: () => {
			dispatch(closeMobileNavigation());
		},
		toggleMobileNavigation: () => {
			dispatch(toggleMobileNavigation());
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
