import React from 'react';
import Steem from '../../libs/steem';
import {connect} from 'react-redux';
import LoadingSpinner from '../LoadingSpinner';
import {documentTitle} from '../DocumentTitle';

class CreatePost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: '',
      imageError: '',
      title: '',
      tag: '',
      description: '',
      tagInputName: 'tag',
      titleInputName: 'title',
      descriprionInputName: 'description',
      tagList: [],
      descriptionLength: 2048,
      disabeleCreating: false,
      renderLoader: false,
      tagError: false,
      titleError: false,
      minPhotoWidth: 640,
      minPhotoHeight: 420,
    };
  }

  componentDidMount() {
    setTimeout(() => { jqApp.forms.init(); }, 0);
  }

  componentWillMount() {
    documentTitle();
  }

  _clearAll() {
    this.setState({
      file: '',
      imagePreviewUrl: '',
      imageError: '',
      title: '',
      tagList: [],
      tag: '',
      description: '',
    });
  }

  handleChange(event) {
    let name = event.target.name;
    let value = event.target.value;

    if (name == this.state.titleInputName) {
      if (value.length >= 256) {
        return false;
      }
    }

    if (name == this.state.tagInputName) {
      let valueArr = value.replace(/[^^a-zA-ZА-Яа-яЁё0-9\s]/g, '').
        toLowerCase().
        split(' ');
      if (valueArr.length >= 20) {
        return false;
      }
      if (valueArr[valueArr.length - 1].length > 32) {
        return false;
      }
      this.setState({
          [name]: value.replace(/[^^a-zA-ZА-Яа-яЁё0-9\s]/g, '').toLowerCase(),
        }, () =>
          this.setState({
            tagList: this.getTagsArray(this.state.tag),
            tagError: false,
          }),
      );
    } else if (name == this.state.titleInputName) {
      this.setState({
        [name]: value,
        titleError: false,
      });
    } else if (name == this.state.descriprionInputName) {
      this.setState({
        [name]: value,
      });
    }
  }

  getTagsArray(stringWithTags) {
    return stringWithTags.replace(/^\s+|\s+$/gm, '').split(/\s+/);
  }

  validateFields() {
    let isValid = true;
    if (this.state.tagList.length > 20) {
      this.setState({
        tagError: true,
      });
      isValid = false;
    }
    if (this.state.title == '') {
      this.setState({
        titleError: true,
      });
      isValid = false;
    }
    if (this.state.file == '') {
      this.setState({
        imageError: 'Photo is required',
      });
      isValid = false;
    }
    return isValid;
  }

  _handleSubmit(e) {
    e.preventDefault();

    if (this.state.disabeleCreating) return false;
    if (!this.validateFields()) return false;

    const callback = (err, success) => {
      if (success) {
        this.setState({
          renderLoader: false,
        }, () => {
          jqApp.pushMessage.open(
            'Post has been successfully created. If you don\'t see the post in your profile, please give it a few minutes to sync from the blockchain');
          setTimeout(() => {
            this.props.history.push(`/@${this.props.username}`);
          }, 1700);
        });
      } else {
        jqApp.pushMessage.open(err);
        this.setState({
          renderLoader: false,
        });
      }
    };
    this.setState({
        renderLoader: true,
      }, () =>
        Steem.createPost(this.props.postingKey, this._getTags(),
          this.props.username, this.state.title, this.state.description,
          this.state.file, callback),
    );
  }

  _getTags() {
    let tags = this.state.tagList.splice(0, 20);
    return tags;
  }

  _handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      let image = new Image();
      image.src = reader.result;

      this.setState({
        file: file,
        imagePreviewUrl: reader.result,
        imageError: '',
        rotate: false,
      }, () => {
        let canvas = this.preview;
        let ctx = canvas.getContext('2d');
        image.onload = () => {
          if (image.width >= this.state.minPhotoWidth &&
            image.height >= this.state.minPhotoHeight) {
            canvas.width = this.previewContainer.clientWidth;
            canvas.height = image.height *
              (this.previewContainer.clientWidth / image.width);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          } else {
            this.setState({
              file: '',
              imagePreviewUrl: '',
              imageError: 'Photo size should be more then ' +
              this.state.minPhotoWidth + 'x' + this.state.minPhotoHeight,
            });
          }
        };
      });
    };
    reader.readAsDataURL(file);
  }

  rotateImage(e) {
    e.preventDefault();
    let canvas = this.preview;
    let ctx = canvas.getContext('2d');

    let image = new Image();
    image.src = this.state.imagePreviewUrl;
    image.onload = () => {
      if (this.state.rotate) {
        canvas.width = this.previewContainer.clientWidth;
        canvas.height = image.width *
          (this.previewContainer.clientWidth / image.height);
      } else {
        canvas.height = this.previewContainer.clientWidth;
        canvas.width = image.height *
          (this.previewContainer.clientWidth / image.width);
      }
      ctx.rotate(90 * Math.PI / 180);
      ctx.translate(0, -canvas.width);
      ctx.drawImage(image, 0, 0, canvas.height, canvas.width);
      fetch(canvas.toDataURL()).then(res => res.blob()).then(blob => {
        this.setState({
          file: blob,
          imagePreviewUrl: canvas.toDataURL(),
          imageError: '',
          rotate: !this.state.rotate,
        });
      });
    };
  }

  _getPostImageStyles(itemImage) {
    return {
      backgroundImage: `url(${itemImage})`,
      backgroundPosition: 'fixed',
      backgroundRepeat: 'no-repeat',
      backgroundOrigin: 'center',
      backgroundClip: 'content-box',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  addTag() {
    let tagList = this.state.tagList;
    tagList.push(this.state.tag);

    this.setState({
      tag: '',
      tagList: tagList,
    });
  }

  removeTag(index) {
    let newTagList = this.state.tagList;
    newTagList.splice(index, 1);
    this.setState({
      tag: newTagList.join(' '),
      tagList: newTagList,
      tagError: false,
    });
  }

  _renderTags() {
    if (this.state.tagList.length == 0) return null;
    if (this.state.tagList[0] == '') return null;
    let _this = this;
    let items = this.state.tagList.map((tag, index) => {
      return (
        <div key={index} className="tag">{tag}
          <button type="button" className="btn-close" onClick={this.removeTag.bind(_this, index)}/>
        </div>
      );
    });
    return items;
  }

  _renderLoader() {
    if (this.state.renderLoader) {
      return <LoadingSpinner/>;
    } else {
      return null;
    }
  }

  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;
    let rotateButton = null;
    let addDescriptionBlock = null;
    let mainContainerClassName = 'col-xs-12 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3 for-justification';

    if (this.state.renderLoader == true) {
      mainContainerClassName = mainContainerClassName + ' blur-blocker';
    }

    let imageError = this.state.imageError
      ? <div className="help-block margin-top--small">
        <div
          className="text--red help-block__notice">{this.state.imageError}</div>
      </div>
      : null;

    addDescriptionBlock =
      <div className="form-group">
        <div className="input-container col-xs-12">
                <textarea type="text"
                          name={this.state.descriprionInputName}
                          id="description"
                          value={this.state.description}
                          onChange={this.handleChange.bind(this)}
                          required=""
                          autoComplete="off"
                          className="form-control"
                          maxLength={this.state.descriptionLength}
                />
          <label htmlFor="description" className="name">Description</label>
          <div className="help-block">
            <div className="help-block__notice">Description is limited
              to {this.state.descriptionLength} characters
            </div>
          </div>
        </div>
      </div>;

    if (imagePreviewUrl) {
      $imagePreview = (
        <div className="preview-component position--relative">
          <div className="post-info">
            <div className="info-block">
              <div className="img-preview"
                   ref={ref => this.previewContainer = ref}>
                <canvas id="preview" ref={ref => this.preview = ref}/>
              </div>
            </div>
          </div>
          <input id="upload-file" className="file-input"
                 onChange={(e) => this._handleImageChange(e)} type="file"/>
        </div>
      );

      rotateButton = <div className="rotate-button">
        <div className="sub-rotate-button" title="rotate"
             onClick={this.rotateImage.bind(this)}>
        </div>
      </div>;

    } else {
      $imagePreview = (
        <div className="upload-field empty">
          <div className="uf-preview">
            <div className="uf-icon"></div>
            <div className="uf-text">Click to upload a picture</div>
          </div>
          <input id="upload-file" className="file-input"
                 onChange={(e) => this._handleImageChange(e)} type="file"/>
        </div>
      );
    }

    return (
      <div>
        <div className={mainContainerClassName}>
          <form className="form-create form-horizontal">
            <div className="form-group">
              <div className="input-container col-xs-12">
                <div className="upload">
                  {$imagePreview}
                </div>
                {imageError}
              </div>
              {rotateButton}
            </div>
            <div className={this.state.titleError ? 'has-error' : ''}>
              <div className="form-group">
                <div className="input-container col-xs-12">
                  <input
                    type="text"
                    name={this.state.titleInputName}
                    id="title"
                    value={this.state.title}
                    onChange={this.handleChange.bind(this)}
                    required=""
                    autoComplete="off"
                    className="form-control autofil--gray"
                  />
                  <label htmlFor="title" className="name">Title<span
                    className="text--red font--small required-star"> *</span></label>
                  <div className="help-block">
                    {
                      this.state.titleError
                        ? <div className="help-block__notice">Title is
                          required</div>
                        : null
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className={this.state.tagError ? 'has-error' : ''}>
              <div className="form-group">
                <div className="input-container col-xs-12">
                  <input type="text"
                         name={this.state.tagInputName}
                         id="tag"
                         value={this.state.tag}
                         onChange={this.handleChange.bind(this)}
                         required=""
                         autoComplete="off"
                         className="form-control autofil--gray"
                  />
                  <label htmlFor="tag" className="name">Tags</label>
                  <div className="tags-list clearfix">
                    {this._renderTags()}
                  </div>
                  <div className="help-block">
                    <div className="help-block__notice">Enter tags with spaces,
                      but not more than 20
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {addDescriptionBlock}
            <div className="form-group">
              <div className="buttons-container">
                <button onClick={this._clearAll.bind(this)} type="reset"
                        className="btn btn-index">Clear
                </button>
                <button onClick={this._handleSubmit.bind(this)} type="submit"
                        className="btn btn-default">Create new post
                </button>
              </div>
            </div>
          </form>
        </div>
        {this._renderLoader()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    localization: state.localization,
    username: state.auth.user,
    postingKey: state.auth.postingKey,
  };
};

export default connect(mapStateToProps)(CreatePost);
