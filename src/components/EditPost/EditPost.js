import React from 'react';
import {connect} from 'react-redux';
import TextInput from "../Common/TextInput/TextInput";
import {
	addTag, changeImage, closeTimer, createPost, editClearAll, editPost, editPostClear, imageNotFound, imageRotate,
	removeTag, setEditPostImageError, setImageContainerSize, setInitDataForEditPost
} from "../../actions/editPost";
import EditTags from "../Common/EditTags/EditTags";
import ShowIf from "../Common/ShowIf";
import {utils} from "../../utils/utils";
import LoadingSpinner from "../LoadingSpinner";
import {documentTitle} from "../../utils/documentTitle";
import './editPost.css';
import Timer from "../Common/Timer/Timer";
import {withWrapper} from "create-react-server/wrapper";
import {addMetaTags, getDefaultTags} from "../../actions/metaTags";
import Constants from "../../common/constants";

class EditPost extends React.Component {

	static async getInitialProps({location, req, res, store}) {
		if (!req || !location || !store) {
			return {};
		}
		await store.dispatch(addMetaTags(getDefaultTags(req.hostname, location.pathname)));
		return {};
	}

	constructor(props) {
		super();
		this.setImageContainerSize = this.setImageContainerSize.bind(this);
		props.setInitDataForEditPost(props.postUrl);
	}

	componentWillReceiveProps(nextProps) {
		documentTitle();
		if (this.props.postUrl !== nextProps.postUrl) {
			this.props.setInitDataForEditPost(nextProps.postUrl);
		}
		if (this.props.rotate !== nextProps.rotate) {
			this.setImageContainerSize(nextProps.rotate);
		}
		return true;
	}

	componentWillUnmount() {
		this.props.editClearAll();
	}

	componentDidMount() {
		documentTitle();
	}

	imageChanged(event) {
		event.preventDefault();
		const reader = new FileReader();
		const file = event.target.files[0];
		if (typeof file === 'object') {
			Object.defineProperty(file, 'name', {
				writable: true
			});
			file.name = `${file.lastModified}-${file.size}-${file.type.replace(/\//, '.')}`;
		} else {
			return;
		}
		reader.onloadend = () => {
			let image = new Image();
			image.src = reader.result;
			image.onload = () => {
				this.props.changeImage(reader.result, image);
			};
			image.onerror = () => {
				this.props.setEditPostImageError(Constants.WRONG_FILE_FORMAT);
			}
		};
		reader.readAsDataURL(file);
	}

	setImageContainerSize(rotate) {
		const MIN_HEIGHT = 400;
		const MAX_WIDTH = Math.min(750, document.documentElement.clientWidth);

		let imgWidth = this.image.naturalWidth;
		let imgHeight = this.image.naturalHeight;
		if (rotate % 180 !== 0) {
			let tmp = imgWidth;
			imgWidth = imgHeight;
			imgHeight = tmp;
		}

		imgHeight = Math.max(imgHeight, MIN_HEIGHT);
		let prefHeight = document.documentElement.clientHeight;
		if (imgHeight < prefHeight) {
			prefHeight = imgHeight;
		}
		imgWidth = imgWidth * prefHeight / imgHeight;
		let prefWidth = imgWidth;
		if (prefWidth > MAX_WIDTH) {
			prefHeight = prefHeight * MAX_WIDTH / prefWidth;
			prefWidth = MAX_WIDTH;
		}

		this.props.setImageContainerSize(prefWidth, prefHeight);
	}

	submit() {
		if (this.props.isNew) {
			this.props.createPost()
		} else {
			this.props.editPost()
		}
	}

	render() {
		if (global.isServerSide) {
			return null;
		}
		return (
			<div className="wrapper_edi-pos">
				<ShowIf show={this.props.loading}>
					<LoadingSpinner style={{height: '100%', position: 'absolute', width: '100%'}}/>
				</ShowIf>
				<div className={'container_edi-pos ' + (this.props.loading ? 'blur-blocker' : '')}>
					<div className="image-container_edi-pos"
							 style={{
								 height: this.props.height,
								 cursor: this.props.isNew ? 'pointer' : 'default'
							 }}
					>
						<ShowIf show={utils.isEmptyString(this.props.src)}>
							<div className="choose-container_edi-pos">
								<div className="upload-icon_edi-pos"/>
								<span className="upload-text_edi-pos">
                  Click to upload a picture
                </span>
							</div>
						</ShowIf>
						<ShowIf show={utils.isNotEmptyString(this.props.src)}>
							<img className="image_edi-pos"
									 src={this.props.src}
									 style={{
										 transform: `rotate(${this.props.rotate}deg)`,
										 maxHeight: this.props.rotate % 180 ? this.props.width : '100%',
										 maxWidth: this.props.rotate % 180 ? '100%' : this.props.width,
									 }}
									 alt='current'
									 ref={ref => this.image = ref}
									 onLoad={() => this.setImageContainerSize(0)}
									 onError={this.props.setImageNotFound}
							/>
							<ShowIf show={this.props.isNew && !this.props.isGif}>
								<div className="rotate-button_edi-pos"
										 onClick={() => this.props.imageRotate(this.image)}
								/>
							</ShowIf>
							<ShowIf show={this.props.imageNotFound}>
								<div className="img-not-found_edi-pos">
									<p className="img-not-found-text_edi-pos">Sorry, image isn't found.</p>
								</div>
							</ShowIf>
						</ShowIf>
						<ShowIf show={this.props.isNew}>
							<input className="file-input_edi-pos"
										 type="file"
										 onChange={this.imageChanged.bind(this)}
							/>
						</ShowIf>
					</div>
					<ShowIf show={this.props.imageError}>
						<div className="image-error_edi-pos">
							{this.props.imageError}
						</div>
					</ShowIf>
					<TextInput title="Title"
										 point={Constants.TEXT_INPUT_POINT.TITLE}
										 multiline={false}
										 required={true}
										 value={this.props.initData.title}
										 noValidCharacters="[А-Яа-я]"
										 maxLength={255}/>
					<TextInput title="Tags"
										 maxLength={Constants.TAGS.MAX_LENGTH}
										 point={Constants.TEXT_INPUT_POINT.TAGS}
										 multiline={false}
										 description="Enter tags with spaces, but not more than 20"
										 noValidCharacters="[^A-Za-z0-9]"
										 keyPressEvents={[{
											 keys: [Constants.KEYS.SPACE, Constants.KEYS.ENTER],
											 func: () => this.props.addTag()
										 }]}>
						<EditTags value={this.props.tags}
											onChange={this.props.removeTag}/>
					</TextInput>
					<TextInput title="Description"
										 point={Constants.TEXT_INPUT_POINT.DESCRIPTION}
										 multiline={true}
										 maxHeight={50000}
										 value={this.props.initData.description}
										 description="Description is limited to 2048 characters"/>
					<div className="buttons-container_edi-pos">
						<button onClick={this.props.editPostClear}
										className="btn btn-index">Clear
						</button>
						<button onClick={this.submit.bind(this)}
										className="btn btn-default"
										disabled={this.props.isNew && !this.props.canCreate}
						>
							{this.getButtonText()}
						</button>
					</div>
				</div>
			</div>
		);
	}

	getButtonText() {
		if (!this.props.canCreate) {
			return (<Timer waitingTime={this.props.waitingTime} onTimeout={this.props.closeTimer}/>)
		}
		return this.props.isNew ? 'Create new post' : 'Update post'
	}
}

const mapStateToProps = (state, props) => {
	const {postUrl} = props.match.params;
	return {
		postUrl,
		...state.editPost
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		addTag: () => {
			dispatch(addTag())
		},
		removeTag: (index) => {
			dispatch(removeTag(index))
		},
		changeImage: (imageSrc, image) => {
			dispatch(changeImage(imageSrc, image))
		},
		imageRotate: (image) => {
			dispatch(imageRotate(image))
		},
		setImageContainerSize: (width, height) => {
			dispatch(setImageContainerSize(width, height))
		},
		setInitDataForEditPost: (postUrl) => {
			dispatch(setInitDataForEditPost(postUrl))
		},
		editPostClear: () => {
			dispatch(editPostClear())
		},
		editClearAll: () => {
			dispatch(editClearAll())
		},
		createPost: () => {
			dispatch(createPost())
		},
		editPost: () => {
			dispatch(editPost())
		},
		setImageNotFound: () => {
			dispatch(imageNotFound())
		},
		closeTimer: () => {
			dispatch(closeTimer())
		},
		setEditPostImageError: (message) => {
			dispatch(setEditPostImageError(message))
		}
	};
};

export default withWrapper(connect(mapStateToProps, mapDispatchToProps)(EditPost));
