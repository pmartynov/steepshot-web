import React from 'react';
import {connect} from 'react-redux';
import {closeModal, setModalOptions} from '../../../actions/modal';
import ReactResizeDetector from 'react-resize-detector';
import ShowIf from '../../Common/ShowIf';
import './modal.css';

class Modal extends React.Component {

	componentDidMount() {
		setTimeout(() => {
			this.container.classList.remove('before-load-back_modal');
			this.body.classList.remove('before-load_modal');
		}, 1);
	}

	shouldComponentUpdate(nextProps) {
		if (nextProps.willClose) {
			this.body.classList.add('before-load_modal');
			this.container.classList.add('before-load-back_modal');
		}
		return true;
	}

	clickOutside(event) {
		event.stopPropagation();
		if (this.body && !this.body.contains(event.target) && !this.props.fullScreenMode) {
			this.props.closeModal(this.props.index);
		}
	}

	update() {
		this.props.setModalOptions(this.props.index, {
			update: this.props.update + 1
		})
	}

	render() {
		let styleBack = {backgroundColor: 'rgba(0, 0, 0, .85)'};
		if (this.props.fullScreenMode) {
			styleBack = {backgroundColor: '#000000'};
		}
		styleBack.alignItems = 'center';
		if (this.body && this.container && (this.body.clientHeight >= this.container.clientHeight)) {
			styleBack.alignItems = 'flex-start';
		}
		styleBack.zIndex = 14;
		return (
			<div className="back_mods before-load-back_modal ov-scroll_modal"
			     onClick={this.clickOutside.bind(this)}
			     style={styleBack}
			     ref={ref => {
				     this.container = ref
			     }}
			>
				<div className="body_modal before-load_modal"
				     ref={ref => {
					     this.body = ref
				     }}
				>
					{this.props.body}
				</div>
				<ShowIf show={!this.props.mobileSize}>
					<ReactResizeDetector handleWidth handleHeight onResize={this.update.bind(this)}/>
				</ShowIf>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	return {
		...state.modals[props.index],
    mobileSize: state.window.width < 815,
		state: state,
		fullScreenMode: state.postModal.fullScreenMode,
		window: state.window
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		closeModal: (index) => {
			dispatch(closeModal(index));
		},
		setModalOptions: (index, options) => {
			dispatch(setModalOptions(index, options))
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
