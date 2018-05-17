import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {closeModal} from "../../actions/modal";
import UsersList from "../UsersList/UsersList";
import CloseButton from "../Common/CloseButton/CloseButton";
import {Scrollbars} from 'react-custom-scrollbars';
import {clearBodyHeight, setLikesFlagsListBodyHeight} from "../../actions/likesFlagsList";
import ReactResizeDetector from 'react-resize-detector';
import TabsBar from "../Common/TabsBar/TabsBar";
import Tab from "../Common/TabsBar/Tab/Tab";
import './likesFlagsList.css';
import {utils} from "../../utils/utils";

class LikesFlagsList extends React.Component {

	constructor(props) {
		super(props);
		this.updateBodyHeight = this.updateBodyHeight.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (!utils.equalsObjects(nextProps.window, this.props.window)) {
			this.updateBodyHeight()
		}
	}

	componentDidUpdate() {
		let currentBody = this.props.activeIndex ? this.flags : this.likes;
		this.updateBodyHeight(undefined, ReactDOM.findDOMNode(currentBody).clientHeight);
	}

	static permLink(url, commentAuthor) {
		if (commentAuthor) {
			let correctPermlink = url.replace(/(@[\w-.]+\/)[^/]+\//, '$1');
			return correctPermlink.replace(/\/@[\w-.]+/, commentAuthor);
		}
		let urlObject = url.split('/');
		return `/${urlObject[urlObject.length - 2]}/${urlObject[urlObject.length - 1]}`;
	}

	updateBodyHeight(width, height) {
		const HEADER_HEIGHT = 48;
		const PADDING_BOTTOM = 40;

		let fullBodyHeight = height ? height : this.props.fullBodyHeight;
		fullBodyHeight = Math.max(fullBodyHeight, 120);
		let preferredBodyHeight = window.innerHeight * 0.95 - HEADER_HEIGHT - PADDING_BOTTOM;
		preferredBodyHeight = Math.min(preferredBodyHeight, fullBodyHeight);
		if (this.props.preferredBodyHeight !== preferredBodyHeight) {
			this.props.setBodyHeight(preferredBodyHeight, fullBodyHeight);
		}
	}

	render() {
		let likesCondition = !this.props.likes || !this.props.likes.users.length;
		let flagsCondition = !this.props.flags || !this.props.flags.users.length;
		let commonLoader = true;
		if (this.props.likes && this.props.flags) {
			if (!this.props.likes.loading && !this.props.flags.loading) {
        commonLoader = false;
			}
		}
		return (
			<div className="container_lik-lis">
				<CloseButton className='close-button_lik-lis' onClick={this.props.closeModal}/>
				<TabsBar point="likesFlags"
								 showLoader={false}
								 alwaysShowNavigation={true}
					>
					<Tab name="Likes" empty={likesCondition && !flagsCondition}>
						<Scrollbars style={{width: '100%', height: this.props.preferredBodyHeight, marginTop: 20}}>
							<UsersList
								isLikesFlags={true}
								point={this.props.point}
								useScrollView={true}
								options={{likes: 1}}
								commonLoader={commonLoader}
							>
								<ReactResizeDetector handleWidth handleHeight onResize={this.updateBodyHeight}
																		 ref={ref => this.likes = ref}/>
							</UsersList>
						</Scrollbars>
					</Tab>
					<Tab name="Flags" empty={flagsCondition && !likesCondition}>
						<Scrollbars style={{width: '100%', height: this.props.preferredBodyHeight, marginTop: 20}}>
							<UsersList
								point={this.props.point}
								useScrollView={true}
								options={{flags: 1}}
								commonLoader={commonLoader}
							>
								<ReactResizeDetector handleWidth handleHeight onResize={this.updateBodyHeight}
																		 ref={ref => this.flags = ref}/>
							</UsersList>
						</Scrollbars>
					</Tab>
				</TabsBar>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	let point = `post${LikesFlagsList.permLink(state.posts[props.postIndex].url, props.commentAuthor)}/voters`;
	return {
		point,
		flags: state.usersList[point + 'JSON_OPTIONS:{"flags":1}'],
		likes: state.usersList[point + 'JSON_OPTIONS:{"likes":1}'],
		...state.likesFlagsList,
		...state.tabsBar.likesFlags,
		window: state.window
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		closeModal: () => {
			dispatch(closeModal('LikesFlagsList'));
		},
		setBodyHeight: (preferredBodyHeight, fullBodyHeight) => {
			dispatch(setLikesFlagsListBodyHeight(preferredBodyHeight, fullBodyHeight))
		},
		clearBodyHeight: (preferredBodyHeight, fullBodyHeight) => {
			dispatch(clearBodyHeight(preferredBodyHeight, fullBodyHeight))
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(LikesFlagsList);
