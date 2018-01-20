import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Constants from '../../common/constants';

class ShareComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
        ...nextProps
    });
  }

  getUrl() {
      return document.location.origin + '/post' + this.state.url;
  }

  onSuccess() {
      jqApp.pushMessage.open("URL has been copied in your clipboard");
  }

  render() {
    return (
        <div className={this.state.containerModifier}>
            <CopyToClipboard text={this.getUrl()}
                onCopy={() => this.onSuccess()}>
                <button title="Share this post" className="btn btn-default btn-xs">{this.state.title}</button>
            </CopyToClipboard>
        </div>
    );
  }
}

ShareComponent.defaultProps = {
    containerModifier : '',
    url : '',
    title : 'share'
}

const mapStateToProps = (state) => {
  return {
    localization : state.localization
  };
};

export default connect(mapStateToProps)(ShareComponent);
