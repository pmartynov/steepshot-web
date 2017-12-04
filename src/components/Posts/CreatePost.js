import React from 'react';
import Steem from '../../libs/steem';
import {
    connect
} from 'react-redux';
import LoadingSpinner from '../LoadingSpinner';

class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: '',
            imagePreviewUrl: '',
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
            titleError: false
        };
    }

    componentDidMount() {
        setTimeout(() => { jqApp.forms.init() }, 0);
    }

    _clearAll() {
        this.setState({
            file: '',
            imagePreviewUrl: '',
            title: '',
            tagList: [],
            tag: "",
            description: ''
        });
    }

    handleChange(event) {

        // id="formDESCRIPTION" <-- second comment in input field

        let name = event.target.name;
        let value = event.target.value;

        if (name == this.state.tagInputName) {
            let valueArr = value.replace(/[^^a-zA-ZА-Яа-яЁё0-9\s]/g, "").toLowerCase().split(' ');
            if(valueArr.length > 4) {
              return false
            }
            if(valueArr[valueArr.length - 1].length > 15) {
              return false
            }
              this.setState({
                  [name] : value.replace(/[^^a-zA-ZА-Яа-яЁё0-9\s]/g, "").toLowerCase()
              }, () =>
                  this.setState({
                      tagList : this.getTagsArray(this.state.tag),
                      tagError : false
                  })
              );

        } else

        if (name == this.state.titleInputName) {
            this.setState({
                [name] : value,
                titleError : false
            });
        } else

        if (name == this.state.descriprionInputName) {
          this.setState({
            [name]: value
          });
        }
    }

    getTagsArray(stringWithTags) {
        return stringWithTags.replace(/^\s+|\s+$/gm, '').split(/\s+/)
    }

    validateFields() {
        let isValid = true;
        if (this.state.tagList.length > 20) {
            this.setState({
                tagError: true
            })
            isValid = false;
        }
        if (this.state.title == '') {
            this.setState({
               titleError: true
            });
            isValid = false;
        }
        if (this.state.file == '') {
            this.setState({
                imageError: true
            })
            isValid = false
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
                    renderLoader : false
                }, () => {
                    jqApp.pushMessage.open('Post has been successfully created. If you don\'t see the post in your profile, please give it a few minutes to sync from the blockchain');
                    setTimeout(() => {
                        this.props.history.push('/profile')
                    }, 1000);
                });
            } else {
                jqApp.pushMessage.open(err);
                this.setState({
                    renderLoader : false,
                });
            }
        };
        this.setState({
            renderLoader : true
        }, () =>
            Steem.createPost(this.props.postingKey, this._getTags(), this.props.username, this.state.title, this.state.description, this.state.file, callback)
        );
    }

    _getTags() {
        let tags = this.state.tagList;
        tags = this.state.tagList.splice(0 , 20);
        return tags;
    }

    _handleImageChange(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onloadend = () => {
            this.setState({
                file: file,
                imagePreviewUrl: reader.result,
                imageError: false
            });
        }

        reader.readAsDataURL(file)
    }

    _getPostImageStyles(itemImage) {
        return {
            backgroundImage: `url(${itemImage})`,
            backgroundPosition: 'fixed',
            backgroundRepeat: 'no-repeat',
            backgroundOrigin: 'center',
            backgroundClip: 'content-box',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
    }

    addTag() {
        let tagList = this.state.tagList;
        tagList.push(this.state.tag);

        this.setState({
            tag: '',
            tagList: tagList
        });
    }

    removeTag(index) {
        let newTagList = this.state.tagList;
        newTagList.splice(index, 1);
        this.setState({
            tag: newTagList.join(' '),
            tagList: newTagList,
            tagError: false
        });
    }

    _renderTags() {
        if (this.state.tagList.length == 0) return null;
        if (this.state.tagList[0] == '') return null;
        let _this = this;
        let items = this.state.tagList.map((tag, index) => {
            return(
            <div key={index} className="tag">{`#${tag}`}
                <button type="button" className="btn-close" onClick={this.removeTag.bind(_this, index)}></button>
            </div>
            )
        });
        return items;
    }

    _renderLoader() {
        if (this.state.renderLoader) {
            return <LoadingSpinner />
        } else {
            return null;
        }
    }

    render() {
        let {imagePreviewUrl} = this.state;
        let $imagePreview = null;
        let addDescriptionBlock = null;

        let imageError =
        this.state.imageError
        ?
        <div className="help-block margin-top--small">
            <div className="text--red help-block__notice">Image is required</div>
        </div>
        :
        null;

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
                    <div className="help-block__notice">Description can be maximum {this.state.descriptionLength} characters</div>
                </div>
            </div>
        </div>

        if (imagePreviewUrl) {
            $imagePreview = (<div className="preview-component">
                <div className="post-info">
                    <div className="info-block">
                        <div className="img-preview">
                            <img className="col-xs-12" src={imagePreviewUrl} />
                        </div>
                    </div>
                </div>
                <input id="upload-file" className="file-input" onChange={(e)=>this._handleImageChange(e)} type="file" />
            </div>);
        } else {
            $imagePreview = (<div className="upload-field empty">
                <div className="uf-preview">
                    <div className="uf-icon"></div>
                    <div className="uf-text">Click to upload a picture</div>
                </div>
                <input id="upload-file" className="file-input" onChange={(e)=>this._handleImageChange(e)} type="file" />
            </div>);
        }

        return (
            <div className="col-xs-12 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">
                <form className="form-create form-horizontal">
                    <div className="form-group">
                        <div className="input-container col-xs-12">
                            <div className="upload">
                                {$imagePreview}
                            </div>
                            {imageError}
                        </div>
                    </div>
                    <div className={this.state.titleError ? 'has-error' : ''} >
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
                                <label htmlFor="title" className="name">Title<span className="text--red font--small required-star"> *</span></label>
                                <div className="help-block">
                                    {
                                        this.state.titleError ? <div className="help-block__notice">Title is required</div>
                                                              : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={this.state.tagError ? 'has-error' : ''} >
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
                                <label htmlFor="tag" className="name">Hashtag<span className="text--red font--small required-star"> *</span></label>
                                <div className="tags-list clearfix">
                                    {this._renderTags()}
                                </div>
                                <div className="help-block">
                                    <div className="help-block__notice">Enter a hashtag(s). But not more than 4 words</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {addDescriptionBlock}
                    <div className="form-group">
                        <div className="buttons-container">
                            <button onClick={this._clearAll.bind(this)} type="reset" className="btn btn-index">Clear</button>
                            <button onClick={this._handleSubmit.bind(this)} type="submit" className="btn btn-default">Create new post</button>
                        </div>
                    </div>
                    {this._renderLoader()}
                </form>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
  return {
    localization: state.localization,
    username: state.auth.user,
    postingKey: state.auth.postingKey
  };
};

export default connect(mapStateToProps)(CreatePost);
