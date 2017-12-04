import React from 'react';
import LocalizedStrings from '../Localization/index.js';
import { connect } from 'react-redux';
import LoadingSpinner from '../LoadingSpinner';
import UserItem from './userItem';
import Constants from '../../common/constants';
import InfiniteScroll from 'react-infinite-scroller';
import HeadingLeadComponent from '../Atoms/HeadingLeadComponent';
import { debounce } from 'lodash';

class UsersComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isComponentVisible : this.props.isComponentVisible == undefined ? true : this.props.isComponentVisible,
      ...this.getInitialData(),
      ...this.props
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

  getInitialData() {
    return {
      loading : true,
      loadingMore : false,
      hasMore : true,
      items : [],
      offset : null,
      previousRequestOffset : 'none'
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

  fetchData() {
    if (this.state.offset == this.state.previousRequestOffset) return false;
    if (!this.state.isComponentVisible && this.state.offset != undefined) return false;
    const options = {
      point : this.state.point,
      params : Object.assign({}, {
        offset : this.state.offset
      },
      this.state.options)
    };
    this.state.getUsers(options, true).then((response) => {
        this.state.items.pop();
        let newItems = this.state.items.concat(response.results);
        let hasMore = !(this.state.offset == response.offset);    
        this.setState({ 
            items: newItems, 
            previousRequestOffset : this.state.offset,
            offset: response.offset,
            hasMore: !(this.state.offset == response.offset),
            loadingMore: false,
            loading : false
        });
    });
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
      this.state.items.map((user, index) => {
        items.push(
          <UserItem
            key={index}
            item={user}
            history={this.props.history} 
          />
        );
      })
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
    return (
        <div>
          {this.renderHeader()} 
          <InfiniteScroll
            pageStart={0}
            initialLoad={true}
            loadMore={debounce(this.fetchData.bind(this), Constants.ENDLESS_SCROLL.DEBOUNCE_TIMEOUT)}
            hasMore={this.state.hasMore}
            loader={
              <div className="position--relative">
                <LoadingSpinner/>
              </div>
            }
            threshold={Constants.ENDLESS_SCROLL.OFFSET}
          >
            <div className={this.state.wrapperModifier}>
              {this.renderItems()}
            </div>
          </InfiniteScroll>
        </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    localization: state.localization
  };
};

export default connect(mapStateToProps)(UsersComponent);
