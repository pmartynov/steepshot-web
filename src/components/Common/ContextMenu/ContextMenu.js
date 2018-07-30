import React from 'react';
import {connect} from 'react-redux';
import './contextMenu.css';
import PropTypes from 'prop-types';
import ShowIf from '../ShowIf';
import {closeContextMenu} from '../../../actions/contextMenu';

class ContextMenu extends React.Component {

	constructor() {
		super();
		this.close = this.close.bind(this);
	}

	shouldComponentUpdate(nextProps) {
		return nextProps.show !== this.props.show
	}

	componentDidUpdate() {
		if (this.props.show) {
			window.addEventListener('click', this.close);
		} else {
			window.removeEventListener('click', this.close);
		}
	}

	close() {
		this.props.closeContextMenu(this.props.point);
	}

	render() {
		const {containerStyle, children, show} = this.props;
		return (
			<ShowIf show={show}>
				<div className="container_context-menu" style={containerStyle}>
					{children}
				</div>
			</ShowIf>
		);
	}
}

ContextMenu.defaultProps = {
	width: "100%",
	height: "100%",
	marginLeft: "0",
	marginTop: "0"
};

ContextMenu.propTypes = {
	width: PropTypes.string,
	height: PropTypes.string,
	marginLeft: PropTypes.string,
	marginTop: PropTypes.string,
	point: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired
};

const mapStateToProps = (state, props) => {
	const contextMenuState = state.contextMenu[props.point] || {};
	const {show} = contextMenuState;
	return {
		containerStyle: {
			...props.style,
			width: props.width,
			height: props.height,
			marginLeft: props.left,
			marginTop: props.top
		},
		show: !!show
	}
};

const mapDispatchToProps = dispatch => {
	return {
		closeContextMenu: (point) => {
			dispatch(closeContextMenu(point))
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
