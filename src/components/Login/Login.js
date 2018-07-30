import React from 'react';
import {connect} from 'react-redux'
import {documentTitle} from '../../utils/documentTitle';
import {addMetaTags, getDefaultTags} from '../../actions/metaTags';
import {withWrapper} from 'create-react-server/wrapper';
import './login.css';
import ShowIf from '../Common/ShowIf';
import {login} from '../../actions/auth';
import ImageGallery from './ImageGallery/ImageGallery';
import {push} from 'react-router-redux';
import Constants from '../../common/constants';
import {switchService} from '../../actions/services';
import {clearLoginErrors} from '../../actions/login';
import Switcher from '../Switcher/Switcher';
import ChooseSteemRegModal from './ChooseSteemRegModal/ChooseSteemRegModal';
import {openModal} from '../../actions/modal';
import SteemConnect from '../../services/SteemConnect';
import GrayInput from '../Common/GrayInput/GrayInput';

const galleryImages = [
	'/images/login/1.png',
	'/images/login/2.png',
	'/images/login/3.png',
	'/images/login/4.png',
	'/images/login/5.png',
	'/images/login/6.png',
	'/images/login/7.png',
	'/images/login/8.png',
	'/images/login/9.png',
	'/images/login/10.png'
];

class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			openVideo: false
		};
		this.clearLoginErrors = this.clearLoginErrors.bind(this);
    documentTitle();
	}

	static async getInitialProps({location, req, res, store}) {
		if (!req || !location || !store) {
			return {};
		}
		await store.dispatch(addMetaTags(getDefaultTags(req.hostname, location.pathname)));
		return {};
	}

	openRegisterSite(event) {
		event.preventDefault();
		if (this.props.chooseSteem) {
			let modalOption = {
				body: (<ChooseSteemRegModal/>),
			};
			this.props.openModal("ChooseSteemRegModal", modalOption);
		} else {
			window.open('https://golos.io/create_account');
		}
	}

	handleLogin(e) {
		e.preventDefault();
		let nameValue = this.name.value;
		let passwordValue = this.password.value;
		nameValue = nameValue.replace(/\s+/g, '');
		nameValue = nameValue.replace(/@([\w-.]+)/, '$1');
		passwordValue = passwordValue.replace(/\s+/g, '');
		this.props.login(nameValue.toLowerCase(), passwordValue);
	}

/*	loginWithSteemConnect() {
    SteemConnect.getLoginUrl();
		window.location.replace(SteemConnect.getLoginUrl() + '&expires_in=6048000');
	}*/

	clearLoginErrors() {
		if (!this.props.usernameError && !this.props.postingKeyError) {
			return;
		}
		this.props.clearLoginErrors();
	}

	render() {
		if (global.isServerSide) {
			return null;
		}
		const {chooseSteem, usernameError, postingKeyError} = this.props;
		return (
			<div className="container_login">
				<ShowIf show={!this.props.isMobileScreen}>
					<div className="welcome-container_login">
						<ImageGallery images={galleryImages}/>
						<div className="gallery-shadow_login"/>
						<div className="welcome-body_login">
							<div className="welcome-title_login">
								Welcome to Steepshot
							</div>
							<div className="welcome-description_login">
								Platform that rewards people for sharing their lifestyle and visual experience
							</div>
							<button className="guidelines-btn_login" onClick={() => {
								this.props.historyPush('/guide')
							}}>
								LINK TO OUR GUIDELINES
							</button>
						</div>
					</div>
				</ShowIf>
				<div className="form-container_login">
					<div className="form-body_login">
						<form className="form_login">
							<div className="title_login">
								Sign in to Steepshot
							</div>
							<div className="input-block_login">
								<GrayInput type="text" label="Username" placeholder="username" ref={ref => this.name = ref}
								       onChange={this.clearLoginErrors} error={usernameError} name="login"/>
								<GrayInput type="password" label="Posting Key" placeholder="e.g. STG52aKIcG9..."
													 ref={ref => this.password = ref} onChange={this.clearLoginErrors} error={postingKeyError}
													 name="password"/>
							</div>
							<div className="btn-block_login">
								<Switcher
									onClick={() => {
										this.clearLoginErrors();
										this.props.switchService();
									}}
									left={chooseSteem}
									leftLabel="Steem"
									rightLabel="Golos"
								/>
								<button className="sign_login btn btn-default" onClick={this.handleLogin.bind(this)} type="submit">
									LOGIN
								</button>
							</div>
						</form>
					</div>
					{/*<div className={'registration-block_login login-steem-con-block_login' +
							(chooseSteem ? '' : ' hide-log-ste-con-block_login')}>
							<label>Don’t you trust us?</label>
							<button className="steem-con-btn_login" onClick={this.loginWithSteemConnect.bind(this)}>
								{(this.props.isMobileScreen ? '' : 'LOGIN WITH ') + 'STEEM CONNECT'}
							</button>
					</div>*/}
					<div className="registration-block_login">
						<label>Don’t have a {chooseSteem ? 'Steem' : 'Golos'} account?</label>
						<button className="guidelines-btn_login create-acc_login" onClick={this.openRegisterSite.bind(this)}>
							REGISTRATION
						</button>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.auth.user,
		isMobileScreen: state.window.isMobileScreen,
		chooseSteem: state.services.name === Constants.SERVICES.steem.name,
		usernameError: state.login.usernameError,
		postingKeyError: state.login.postingKeyError
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		login: (name, postingKey) => {
			dispatch(login(name, postingKey));
		},
		historyPush: (path) => {
			dispatch(push(path))
		},
		switchService: () => {
			dispatch(switchService())
		},
		clearLoginErrors: () => {
			dispatch(clearLoginErrors())
		},
		openModal: (index, options) => {
			dispatch(openModal(index, options));
		}
	}
};

export default withWrapper(connect(mapStateToProps, mapDispatchToProps)(Login));
