import * as React from 'react';
import Menu from './Menu/Menu';
import ChooseSocialNetwork from './ChooseSocialNetwork/ChooseSocialNetwork';
import ConfirmFlagModal from './ConfirmFlagModal/ConfirmFlagModal';
import {connect} from 'react-redux';
import {toggleFlag} from '../../actions/flag';
import {copyToClipboard} from '../../actions/clipboard';
import {closeAllModals, closeModal, openModal} from '../../actions/modal';
import {deletePost} from '../../actions/post';
import './postContextMenu.css';
import {push} from 'react-router-redux';
import {pushMessage} from '../../actions/pushMessage';
import Constants from '../../common/constants';
import AuthService from '../../services/AuthService';
import ChainService from '../../services/ChainService';

class PostContextMenu extends React.Component {

	constructor(props) {
		super(props);
		let buttonsOptions = this.setButtonsOptions(props);
		this.state = {
			showModal: false,
			fullScreen: false,
			BUTTONS_OPTIONS: buttonsOptions
		};
		this.openMenuModal = this.openMenuModal.bind(this);
	}

	hidePost() {

	}

	deletePost() {
		this.props.deletePost(this.props.index);
	}

	editPost() {
		this.props.historyPush('/editPost' + this.props.item.url);
		this.props.closeModal("MenuModal");
	}

	sharePost() {
		let modalOption = {
			body: (<ChooseSocialNetwork closeModal={() => {
				this.props.closeModal("ChooseSocialNetwork")
			}}
			                            url={this.props.index}
			                            item={this.props.item}
			/>)
		};
		this.props.openModal("ChooseSocialNetwork", modalOption);
	}

	copyLink() {
		let url = document.location.origin + (this.props.isGolosService ? '/' + Constants.SERVICES.golos.name : '')
			+ '/post' + this.props.item.url;
		this.props.copyToClipboard(url);
		this.props.closeModal("MenuModal");
	}

	embed() {

	}

	toggleFlag() {
		if (!this.props.isAuth) {
			this.props.pushMessage(Constants.VOTE_ACTION_WHEN_NOT_AUTH);
			return;
		}
		if (!this.props.item.flag) {
			let modalOption = {
				body: (<ConfirmFlagModal postIndex={this.props.index}/>)
			};
			this.props.openModal("ConfirmFlagModal", modalOption);
		} else {
			this.props.toggleFlag(this.props.index);
			this.props.closeModal("MenuModal");
		}
	}

	openMenuModal() {
		let modalOption = {
			body: (<Menu buttonOption={this.state.BUTTONS_OPTIONS}
			             closeModal={() => this.props.closeModal("MenuModal")}/>)
		};
		this.props.openModal("MenuModal", modalOption);
	}

	render() {
		return (
			<div className="container_pos-con-men" style={this.props.style}>
				<div className="container_post-men-but" onClick={this.openMenuModal} style={this.props.style}>
					<div className="shape_post-men-but" alt="Open post menu" title="Open post menu"/>
				</div>
			</div>
		);
	}

	setButtonsOptions(props) {
		let BUTTONS_OPTIONS = [
			{
				img: '/images/postContextMenu/shareTrue.svg',
				revertImg: '/images/postContextMenu/shareFalse.svg',
				alt: 'Share',
				callback: this.sharePost.bind(this),
				hasDelimiter: true,
			}, {
				img: '/images/postContextMenu/copyTrue.svg',
				revertImg: '/images/postContextMenu/copyFalse.svg',
				alt: 'Copy link',
				callback: this.copyLink.bind(this),
				hasDelimiter: false,
			},
			// TODO uncomment when will be implemented embed
			/*{
				img: '/images/postContextMenu/embedTrue.svg',
				revertImg: '/images/postContextMenu/embedFalse.svg',
				alt: 'Embed',
				callback: this.embed.bind(this),
				hasDelimiter: false,
			},*/
		];

		let tmp;
		let author = props.index.match(/@[\w-.]+/)[0];
		if (author === `@${props.username}`) {
			tmp = [];
			if (new Date(props.item['cashout_time']) > new Date()) {
				tmp.push({
					img: '/images/postContextMenu/editTrue.svg',
					revertImg: '/images/postContextMenu/editFalse.svg',
					alt: 'Edit',
					callback: this.editPost.bind(this),
					hasDelimiter: true,
				});
				tmp.push({
					img: '/images/postContextMenu/deleteTrue.svg',
					revertImg: '/images/postContextMenu/deleteFalse.svg',
					alt: 'Delete',
					callback: this.deletePost.bind(this),
					hasDelimiter: true,
				});
			}
		} else {
			tmp = [
				{
					img: '/images/flagTrue.svg',
					revertImg: '/images/flagFalse.svg',
					alt: 'Flag/Unflag',
					callback: this.toggleFlag.bind(this),
					hasDelimiter: true,
				}, /* TODO uncomment when will be implemented hide
        {
          img: '/images/postContextMenu/hideTrue.svg',
          revertImg: '/images/postContextMenu/hideFalse.svg',
          alt: 'Hide',
          callback: this.hidePost.bind(this),
          hasDelimiter: true,
        }*/];
		}
		return tmp.concat(BUTTONS_OPTIONS);
	}

}


const mapStateToProps = (state) => {
	return {
		username: state.auth.user,
		isAuth: AuthService.isAuth(),
		isGolosService: ChainService.usingGolos()
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		toggleFlag: (postIndex) => {
			dispatch(toggleFlag(postIndex));
		},
		copyToClipboard: (text) => {
			dispatch(copyToClipboard(text));
		},
		openModal: (index, options) => {
			dispatch(openModal(index, options));
		},
		closeModal: (index) => {
			dispatch(closeModal(index));
		},
		deletePost: (index, isContextMenu) => {
			dispatch(deletePost(index, isContextMenu));
		},
		closeAllModals: () => {
			dispatch(closeAllModals());
		},
		historyPush: (path) => {
			dispatch(push(path))
		},
		pushMessage: (message) => {
			dispatch(pushMessage(message))
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(PostContextMenu);
