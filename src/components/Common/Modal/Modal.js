import React from 'react';
import ShowIf from '../ShowIf';

class Modal extends React.Component {
  static defaultProps = {
    showCloseButton: true,
    fullParam: true
  };

  constructor(props) {
    super(props);
    this.state = {
      alignSelf: 'center',
      closeParam: false
    }
  }

  clickOutside(event) {
    event.stopPropagation();
    if (this.modalContainer && !this.modalContainer.contains(event.target) && this.props.fullParam) {
      this.props.closeFunc();
    }
  }

  componentDidMount() {
    this.closeButtonFunc();
    window.addEventListener('resize', () => {
      this.closeButtonFunc();
    })
  }

  closeButtonFunc() {
    if (document.documentElement.clientWidth <= 815) {
      this.setState({closeParam : false});
    } else {
      this.setState({closeParam : true});
    }
  }

  componentDidUpdate() {
    let alignSelf = 'center';
    if (this.props.show) {
      if (this.modalContainer.clientHeight > this.wrapper.clientHeight) {
        alignSelf = 'flex-start';
      }
    }
    if (this.state.alignSelf != alignSelf) {
      this.setState({
        alignSelf: alignSelf,
      })
    }
    if (this.wrapper) {
      if (this.props.fullParam) {
        this.wrapper.style.backgroundColor = 'rgba(0, 0, 0, .7)';
        this.modalContainer.style.backgroundColor = '#ffffff';
      } else {
        this.wrapper.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        this.modalContainer.style.backgroundColor = 'black';
      }
    }
  }

  backModal() {
    this.props.backModal();
  }

  render() {
    let zIndexStyle = {zIndex: 1002};
    return (
      <ShowIf show={this.props.show}>
        <div className="modal-component_mod">
          <ShowIf show={!this.props.fullScreen}>
            <div className="back_mod"
                 onClick={this.clickOutside.bind(this)}
                 style={zIndexStyle}
                 ref={ ref => {this.wrapper = ref} }
            >
              <ShowIf show={this.state.closeParam}>
                <ShowIf show={this.props.closeButton}>
                  <button className="close_mod" onClick={this.props.closeFunc.bind(this)} />
                </ShowIf>
              </ShowIf>
              <ShowIf show={!this.props.fullParam}>
                <div title="Modal screen"
                     className="outer-full-screen_item-mod full-screen_item-mod2"
                     onClick={this.backModal.bind(this)}
                />
              </ShowIf>
              <div className={this.props.styles}
                   ref={ ref => {this.modalContainer = ref} }
                   style={{alignSelf: this.state.alignSelf}}>
                   {this.props.children}
              </div>
            </div>
          </ShowIf>
          <ShowIf show={this.props.fullScreen}>
            <div className="container-full-screen_mod" style={zIndexStyle}>
              {this.props.children}
            </div>
          </ShowIf>
        </div>
      </ShowIf>
    );
  }
}

export default Modal;
