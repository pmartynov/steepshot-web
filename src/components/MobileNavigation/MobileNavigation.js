import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import ShowIf from '../Common/ShowIf';
import {logout} from '../../actions/auth';
import './mobileNavigation.css';
import {closeMobileNavigation} from '../../actions/mobileNavigation';
import {Scrollbars} from 'react-custom-scrollbars';
import AuthService from '../../services/AuthService';

class MobileNavigation extends React.Component {

	handleLogout(event) {
		console.log('click');
		event.preventDefault();
		this.props.closeMobileNavigation();
		this.props.logout();
	}

	render() {
		const {isAuth, name, opened, urls, labels, closeMobileNavigation} = this.props;
		return (
			<ShowIf show={isAuth}>
				<div className={'container_mobile' + (opened ? ' opened_mobile' : '')}
				     onClick={this.props.closeMobileNavigation}>
					<div className="menu_mobile" style={this.props.menuMobilePaddingTop}>
						<Scrollbars>
							<div className="menu-items_mobile">
								<Link
									to={urls.userProfileBase + name}
									onClick={closeMobileNavigation}
								>
									{labels.profileLabel}
								</Link>
								<Link
									to={urls.feed}
									onClick={closeMobileNavigation}
								>
									{labels.feedLabel}
								</Link>
								<Link
									to={urls.browse}
									onClick={closeMobileNavigation}
								>
									{labels.browseLabel}
								</Link>
								<Link
									to={urls.wallet}
									onClick={closeMobileNavigation}
								>
									{labels.walletLabel}
								</Link>
								<Link
									to={urls.settings}
									onClick={closeMobileNavigation}
								>
									{labels.settingsLabel}
								</Link>
								<a onClick={this.handleLogout.bind(this)}>
									{labels.logoutLabel}
								</a>
							</div>
						</Scrollbars>
					</div>
				</div>
			</ShowIf>
		)
	}
}

MobileNavigation.defaultProps = {
	labels: {
		profileLabel: "Profile",
		feedLabel: "Feed",
		browseLabel: "Browse",
		settingsLabel: "Settings",
		logoutLabel: "Logout",
		loginLabel: "Sign in",
		walletLabel: "Wallet"
	},
	urls: {
		feed: "/feed",
		userProfileBase: "/@",
		settings: "/settings",
		login: "/signin",
		browse: "/browse",
		wallet: "/wallet"
	}
};

const mapStateToProps = (state) => {
	const menuMobilePaddingTop = !state.advertising.advertisingStatus ? {paddingTop: 160} : {};
	return {
		menuMobilePaddingTop,
		isAuth: AuthService.isAuth(),
		name: state.auth.user,
		opened: state.mobileNavigation.opened
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => {
			dispatch(logout());
		},
		closeMobileNavigation: () => {
			dispatch(closeMobileNavigation());
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(MobileNavigation);
