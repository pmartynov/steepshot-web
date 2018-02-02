import React from 'react';
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import Constants from '../../common/constants';
import InfiniteScroll from 'react-infinite-scroller';
import LoadingSpinner from '../LoadingSpinner';
import HeadingLeadComponent from '../Atoms/HeadingLeadComponent';
import {clearUsersList, getUsersList, initUsersList} from '../../actions/usersList';
import {documentTitle} from '../DocumentTitle';
import UserItem from '../UserProfile/userItem';

class UsersList extends React.Component {
  static defaultProps = {
    isComponentVisible: true,
  };

  constructor(props) {
    super(props);
    this.props.clearUsersList(this.props.point);
    let usersListOptions = {
      point: this.props.point,
      loading: false,
      hasMore: true,
      users: [],
      offset: null,
      options: this.props.options,
      loader: true
    };
    this.props.initUsersList(usersListOptions);
    this.getUsersList = this.getUsersList.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.options && (nextProps.options.query !== this.props.options.query)) {
      let usersListOptions = {
        point: nextProps.point,
        loading: false,
        hasMore: true,
        users: [],
        offset: null,
        options: nextProps.options,
        loader: true
      };
      this.props.initUsersList(usersListOptions);
      this.getUsersList();
    }
  }

  getUsersList() {
    this.props.getUsersList(this.props.point, this.props.getUsers);
  }

  componentDidMount() {
    this.getUsersList();
    documentTitle();
  }

  renderUsers() {
    if(this.props.loader) {
      return (
        <span/>
      )
    };
    if (!this.props.users || !this.props.users[0]) {
      return (
        <div className="empty-query-message">
          {Constants.EMPTY_QUERY}
        </div>
      );
    }
    let users = [];
    this.props.users.map((user, index) => {
      users.push(
        <UserItem
          key={index}
          item={user}
        />,
      );
    });
    return users;
  }

  renderHeader() {
    if (this.props.headerText) return (
      <HeadingLeadComponent text={this.props.headerText}/>
    );
    return null;
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        <InfiniteScroll
          pageStart={0}
          initialLoad={false}
          loadMore={debounce(this.getUsersList,
            Constants.ENDLESS_SCROLL.DEBOUNCE_TIMEOUT)}
          hasMore={this.props.isComponentVisible && this.props.hasMore}
          loader={<LoadingSpinner/>}
          threshold={Constants.ENDLESS_SCROLL.OFFSET}
        >
          <div className={this.props.wrapperModifier}>
            {this.renderUsers()}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    ...state.usersList[props.point],
    options: props.options
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    initUsersList: (options) => {
      dispatch(initUsersList(options));
    },
    getUsersList: (point, func) => {
      dispatch(getUsersList(point, func));
    },
    clearUsersList: (point) => {
      dispatch(clearUsersList(point));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersList);
