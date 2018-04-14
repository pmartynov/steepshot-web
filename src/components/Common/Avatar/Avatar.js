import React from 'react';
import {connect} from 'react-redux';
import Constants from '../../../common/constants';
import ShowIf from '../ShowIf';
import './avatar.css';
import {setAvatarTip, setAvatarTipTimeout} from '../../../actions/avatar';

class Avatar extends React.Component {
	static defaultProps = {
		style: {}
	};

	componentWillReceiveProps(nextProps) {
		this.powerIndicator(nextProps.votingPower);
	}

	pic() {
		return Object.assign({}, this.props.style, {
			backgroundImage: 'url(' + this.props.src + ')'
		});
	}

	picError() {
		return Object.assign({}, this.props.style, {
			backgroundImage: 'url(' + Constants.NO_AVATAR + ')'
		});
	}

	powerIndicator(votingPower) {
		if (this.canvas) {
			let ctx = this.canvas.getContext('2d');
			let ratio = window.devicePixelRatio;
			let style = this.canvas.style;
			style.width = '112px';
			style.height = '112px';
			style.left = '-6px';
			style.top = '-6px';
			this.canvas.width = 112 * ratio;
			this.canvas.height = 112 * ratio;
			let coords = 56, radius = 54, lineWidth = 3, gradStart = 50, gradEnd = 150;
			if (this.props.headerAvatar) {
				style.width = '30px';
				style.height = '30px';
				style.left = '-5px';
				style.top = '-5px';
				this.canvas.width = 30 * ratio;
				this.canvas.height = 30 * ratio;
				coords = 15;
				radius = 13;
				lineWidth = 2;
				gradStart = 10;
				gradEnd = 30;
			}
			ctx.scale(ratio, ratio);
			if (!this.props.headerAvatar) {
				ctx.beginPath();
				ctx.arc(coords, coords, radius, 2 * Math.PI, 0);
				ctx.strokeStyle = '#d1d5d8';
				ctx.lineWidth = lineWidth;
				ctx.stroke();
				ctx.closePath();
			}
			ctx.beginPath();
			ctx.lineCap = 'round';
			ctx.arc(coords, coords, radius, (votingPower / 50) * Math.PI, 0, true);
			ctx.lineWidth = lineWidth;
			let grad = ctx.createLinearGradient(gradStart, gradStart, gradEnd, gradEnd);
			grad.addColorStop(0.1, '#ff7700');
			grad.addColorStop(0.5, '#ff1000');
			ctx.strokeStyle = grad;
			ctx.stroke();
		}
	}

	showTip() {
		if (!this.props.headerAvatar) {
			this.props.setAvatarTip(true);
		}
	}

	hideTip() {
		if (this.props.tipTimeout) {
			return;
		}
		this.tipVotingPower.classList.add('tip-hide_ava-com');
		let tipTimeout = setTimeout(() => {
			this.props.setAvatarTip(false);
			this.props.setAvatarTipTimeout(null);
		}, 4000);
		this.props.setAvatarTipTimeout(tipTimeout);
	}

	render() {
		return (
			<div className={this.props.powerIndicator ? 'position--relative' : ''}>
				<ShowIf show={this.props.powerIndicator}>
					<canvas ref={ref => this.canvas = ref}
									className="border-indicator_ava-com"
									onTouchStart={this.showTip.bind(this)}
									onTouchEnd={this.hideTip.bind(this)}
									onMouseEnter={this.showTip.bind(this)}
					/>
					<ShowIf show={!this.props.headerAvatar && this.props.isTip}>
						<div ref={ref => {
							this.tipVotingPower = ref
						}}
								 className="tip-voting-power_ava-com prevent--selection"
								 onTouchStart={() => {
									 return;
								 }}
								 onMouseEnter={() => {
									 return;
								 }}
								 onMouseLeave={this.hideTip.bind(this)}
						>
							<p>Power of like: {this.props.votingPower}%</p>
						</div>
					</ShowIf>
				</ShowIf>
				<div className="pic_ava-com" style={this.picError()}>
					<div className="pic_ava-com" style={this.pic()}/>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		votingPower: state.auth.voting_power,
		isTip: state.avatar.isTip,
		tipTimeout: state.avatar.tipTimeout
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		setAvatarTip: (param) => {
			dispatch(setAvatarTip(param));
		},
		setAvatarTipTimeout: (timeout) => {
			dispatch(setAvatarTipTimeout(timeout));
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Avatar);
