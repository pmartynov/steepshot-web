import React from 'react';
import LocalizedStrings from '../Localization/index.js';
import { getPosts } from '../../actions/posts';
import { connect } from 'react-redux';
import LoadingSpinner from '../LoadingSpinner';
import PostItem from '../Posts/Item';
import Constants from '../../common/constants';
import ItemModal from '../Posts/ItemModal';
import InfiniteScroll from 'react-infinite-scroller';
import HeadingLeadComponent from '../Atoms/HeadingLeadComponent';
import { debounce } from 'lodash';
import {
  addFlag, addUpdateFlagInComponentFunc,
  clearFlags,
} from '../../actions/flag';
import Modal from '../Common/Modal/Modal';

class ItemsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.props.clearFlagsInStore();
    this.props.addUpdateFlagInComponentFunc(this.updateFlagInComponent.bind(this));
    this.state = {
      ...this.getInitialData(),
      authorName : this.props.username,
      point : this.props.point,
      wrapperModifier : this.props.wrapperModifier,
      cancelPrevious : this.props.cancelPrevious == undefined ? false : this.props.cancelPrevious,
      options : this.props.options,
      getPosts : this.props.getPosts == undefined ? getPosts : this.props.getPosts,
      headerText : this.props.headerText,
      renderNotEmptyOnly : this.props.renderNotEmptyOnly == undefined ? false : this.props.renderNotEmptyOnly,
      isComponentVisible : this.props.isComponentVisible == undefined ? true : this.props.isComponentVisible,
      ignored : this.props.ignored == undefined ? [] : this.props.ignored,
      maxPosts : this.props.maxPosts || 9999
    };
  }

  fullRefresh(customProps) {
    this.setState({
      ...this.getInitialData(),
      ...customProps
    }, () => {
      this.fetchData();
    })
  }

  componentDidMount() {
    this.fetchData();
  }

  spinnerControlFunc() {
    if(this.state.items.length <= 2) {
      this.setState({hasMore: false});
    }
    let location = document.location.pathname.match(/\/@\w+/);
    if (location == null) {
      if(this.state.items.length <= 3) {
        this.setState({hasMore: false});
      }
    }
  }

  getInitialData() {
    return {
      loading : true,
      loadingMore : false,
      offset : null,
      items : [],
      hasMore : true,
      previousRequestOffset : 'none',
      clearPostHeader : this.props.clearPostHeader,
      showModal : false,
      fullScreen : false,
      customFullScreen : true
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.forceRefresh) {
      this.fullRefresh(nextProps)
    } else
    this.setState({
        ...nextProps
    });
  }

  backModal() {
    this.setState({customFullScreen: true});
  }

  fetchData() {
    if (this.state.offset == this.state.previousRequestOffset || !this.state.hasMore) return false;
    if (!this.state.isComponentVisible && this.state.offset != undefined) return false;
    if (this.state.items.length > this.state.maxPosts - 1) {
      this.setState({ hasMore : false });
      return false;
    }
    const options = {
      point : this.state.point,
      params : Object.assign({}, {
        offset : this.state.offset
      },
      this.state.options)
    };

    this.setState({
      previousRequestOffset : this.state.offset
    }, () => {
      this.state.getPosts(options, this.state.cancelPrevious).then((response) => {
        let newPosts;
        if (this.state.items.length == 0) {
          newPosts = this.state.items.concat(response.results.slice(0, response.results.length));
        } else {
          newPosts = this.state.items.concat(response.results.slice(1, response.results.length));
        }

        newPosts.forEach((post, index) => {
          let urlObject = post.url.split('/');
          let options = {
            index: index,
            state: post.flag,
            isFlagLoading: false,
            author: post.author,
            postId: urlObject[urlObject.length - 1]
          };
          this.props.addFlagToStore(options);
        });

        let hasMore = !(this.state.offset == response.offset);
        if (this.state.items.length + response.results.length <= 4) hasMore = false;
        this.setState({
          items: newPosts,
          offset: response.offset,
          hasMore: hasMore,
          loading: false
        });
        if (/\/search\/\w+/.test(document.location.pathname)) {
          this.props.controlTabs(newPosts.length);
        }
      });
    });
  }

  updateVoteInComponent(vote, index) {
    let newItems = this.state.items;
    if (vote && newItems[index].flag) {
      newItems[index].flag = false;
    }

    vote ? newItems[index].net_votes++ : newItems[index].net_votes--;
    vote ? newItems[index].net_likes++ : newItems[index].net_likes--;
    newItems[index].vote = vote;
    this.setState({
      items: newItems
    });
  }

  updateFlagInComponent(flag, index) {
    let newItems = this.state.items;
    if (flag && newItems[index].vote) {
      newItems[index].net_votes--;
      newItems[index].net_likes--;
      newItems[index].vote = false;
    }
    newItems[index].flag = flag;
    this.setState({
      items: newItems
    });
  }

  fullParam(param) {
    this.setState({customFullScreen : param});
  };

  closeFunc() {
    document.body.style.overflowY = 'auto';
    this.setState({showModal: false, customFullScreen : true});
  }

  openFunc(index) {
    this.setState({
      currentItem : index
    }, () => {
      document.body.style.overflowY = 'hidden';
      this.setState({showModal: true});
    });
  }

  _renderModal() {
      if (this.state.currentItem != undefined) {
        return (
          <ItemModal
            item={this.state.items[this.state.currentItem]}
            items={this.state.items}
            index={this.state.currentItem}
            updateVoteInComponent={this.updateVoteInComponent.bind(this)}
            updateFlagInComponent={this.updateFlagInComponent.bind(this)}
            loadMore={this.fetchData.bind(this)}
            hasMore={this.state.hasMore}
            fullParam={this.fullParam.bind(this)}
            closeFunc={this.closeFunc.bind(this)}
            fullCallBack={this.state.customFullScreen}
          />
        );
      }
      return null;
  }

  renderItems() {
    if (this.state.loading) return null;
    if (this.state.items.length == 0) {
      return (
        <div className="empty-query-message">
          {Constants.EMPTY_QUERY}
        </div>
      )
    } else {
      let items = [];
      this.state.items.map((post, index) => {
        if (this.state.ignored.indexOf(post.url) == -1)
        items.push(
          <PostItem
            key={index}
            item={post}
            index={index}
            openModal={this.openFunc.bind(this)}
            updateVoteInComponent={this.updateVoteInComponent.bind(this)}
            updateFlagInComponent={this.updateFlagInComponent.bind(this)}
            clearPostHeader={this.state.clearPostHeader}
          />
        );
      });
      return items;
    }
  }

  renderHeader() {
    if (this.state.headerText) return (
      <HeadingLeadComponent text={this.state.headerText} />
    );
    return null;
  }

  render() {
    if (this.state.renderNotEmptyOnly && this.state.items.length == 0) return null;

    return (
      <div>
        {this.renderHeader()}
        <InfiniteScroll
          pageStart={0}
          initialLoad={false}
          loadMore={debounce(this.fetchData.bind(this), Constants.ENDLESS_SCROLL.DEBOUNCE_TIMEOUT)}
          hasMore={this.state.hasMore}
          loader={
            <div className="position--relative">
              <LoadingSpinner />
            </div>
          }
          threshold={Constants.ENDLESS_SCROLL.OFFSET}
        >
          <div className={this.state.wrapperModifier}>
            {this.renderItems()}
          </div>
        </InfiniteScroll>
        <Modal
          show={this.state.showModal}
          closeFunc={this.closeFunc.bind(this)}
          fullScreen={false}
          closeButton={true}
          fullParam={this.state.customFullScreen}
          styles={'container_mod mobile-modal'}
          backModal={this.backModal.bind(this)}
        >
          {this._renderModal()}
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    localization: state.localization
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addFlagToStore: (options) => {
      dispatch(addFlag(options));
    },
    clearFlagsInStore: () => {
      dispatch(clearFlags());
    },
    addUpdateFlagInComponentFunc: (func) => {
      dispatch(addUpdateFlagInComponentFunc(func));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ItemsComponent);
