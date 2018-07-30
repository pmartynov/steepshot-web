import React from 'react';
import PropTypes from 'prop-types';
import './imageGallery.css';

let swapPhotoTimeout = null;
let fideToNextTimeout = null;

class ImageGallery extends React.Component {

	constructor(props) {
		super();
		this.state = {
			opacity: 100,
			currentImage: 0,
			countImages: props.images.length,
		};
		this.fadeToNext = this.fadeToNext.bind(this);
		this.startSwapPhoto = this.startSwapPhoto.bind(this);
		swapPhotoTimeout = setTimeout(
			this.startSwapPhoto,
			props.showTime
		)
	};

	startSwapPhoto() {
		fideToNextTimeout = setTimeout(this.fadeToNext, this.props.swappingSpeed)
	}

	fadeToNext() {
		let opacity = this.state.opacity - 1;
		let currentImage = this.state.currentImage;
		if (opacity <= 1) {
			opacity = 100;
			currentImage = (currentImage + 1) % this.state.countImages;
		}
		this.setState({
			opacity,
			currentImage
		}, () => {
			if (opacity !== 100) {
				fideToNextTimeout = setTimeout(this.fadeToNext, this.props.swappingSpeed);
			} else {
				swapPhotoTimeout = setTimeout(this.startSwapPhoto, this.props.showTime);
			}
		});
	}

	componentWillUnmount() {
		clearTimeout(swapPhotoTimeout);
		clearTimeout(fideToNextTimeout);
	}

	render() {
		const {currentImage, opacity} = this.state;
		const images = this.props.images;
		return (
			<div className="container_img-gal">
				<img src={images[currentImage]} className="image_img-gal" style={{opacity: opacity / 100}} alt=""/>
				<img src={images[(currentImage + 1) % 10]} className="image_img-gal"
				     style={{opacity: (100 - opacity) / 100}}
				     alt=""/>
			</div>
		)
	}
}

ImageGallery.propTypes = {
	images: PropTypes.arrayOf(PropTypes.string).isRequired,
	showTime: PropTypes.number,
	swappingSpeed: PropTypes.number
};

ImageGallery.defaultProps = {
	showTime: 5000,
	swappingSpeed: 10
};

export default ImageGallery;