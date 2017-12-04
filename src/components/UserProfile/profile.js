import React from 'react';
import ReactDOM from 'react-dom';
import LocalizedStrings from '../Localization/index.js';
import {
  getUserProfile
} from '../../actions/profile';
import {
  withRouter
} from 'react-router-dom';
import {
  getFollowers,
  getFollowing
} from '../../actions/posts';
import { connect } from 'react-redux';
import UsersComponent from './UsersComponent';
import FollowComponent from '../Posts/FollowComponent';
import ItemsComponent from './itemsComponent';
import Constants from '../../common/constants';
import TabsFilterComponent from '../Filters/TabsFilterComponent';
import TabsWrapper from '../Wrappers/TabsWrapper';
import AvatarComponent from '../Atoms/AvatarComponent';

class UserProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      watcher : this.props.user,
      authorName : this.props.username,
      profile : null,
      localize : LocalizedStrings.getInstance(),
      showFollow : this.props.showFollow !== undefined ? this.props.showFollow  : true,
      itemsPoint : this.insertUsername(Constants.POSTS_FILTERS.POSTS_USER.point, this.props.username),
      followingPoint : this.insertUsername(Constants.USERS_FILTERS.FOLLOWING.point, this.props.username),
      followersPoint : this.insertUsername(Constants.USERS_FILTERS.FOLLOWERS.point, this.props.username),
      keys : [
        { label : Constants.POSTS_FILTERS.POSTS_USER.label },
        { label : Constants.USERS_FILTERS.FOLLOWERS.label },
        { label : Constants.USERS_FILTERS.FOLLOWING.label }
      ],
      activeItemIndex : 0
    };
  }

  componentDidMount() {
    this.getUserProfile();
  }

  updateActiveTab(index) {
    this.setState({
      activeItemIndex : index
    })
  }

  getUserProfile(userName) {
    this.setState({
      wrongProfile : false,
      profile : undefined
    }, () => {
      let showFollow = true;
      userName = userName || this.state.authorName;
      getUserProfile(userName).then((result) => {
        if (result.length == 0) {
          this.props.history.push('*');
          return false;
        }
        if (this.state.watcher == userName || this.state.watcher == undefined) {
          showFollow = false;
        }
        this.setState({
          showFollow: showFollow,
          profile: result,
          avatar: result.profile_image,
          keys : [
            { label : `${result.post_count} ${Constants.POSTS_FILTERS.POSTS_USER.label}` },
            { label : `${result.followers_count} ${Constants.USERS_FILTERS.FOLLOWERS.label}`},
            { label : `${result.following_count} ${Constants.USERS_FILTERS.FOLLOWING.label}`}
          ],
          needsForceRefresh : true
        }, () => {
          this.filterNav.switchFilter(0);
          this.setState({
            needsForceRefresh : false
          })
        });
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.username === this.state.authorName) {
        return;
    }
    this.setState({
        avatar : Constants.NO_AVATAR,
        authorName: nextProps.username,
        itemsPoint : this.insertUsername(Constants.POSTS_FILTERS.POSTS_USER.point, nextProps.username),
        followingPoint : this.insertUsername(Constants.USERS_FILTERS.FOLLOWING.point, nextProps.username),
        followersPoint : this.insertUsername(Constants.USERS_FILTERS.FOLLOWERS.point, nextProps.username)
    });

    this.getUserProfile(nextProps.username);
  }

  insertUsername(point, userName) {
      if (userName == undefined) return point;
      let path = point.split('/');
      return `${path[0]}/${userName}/${path[1]}`;
  }

  render() {
    let profileImageSrc = this.state.avatar || Constants.NO_AVATAR;
    let name = '';
    let website = '';
    let about = '';
    let location = '';
    let balance = 0;

    if (this.state.profile) {
      name = this.state.profile.name;
      if (name == undefined || name == '') name = `@${this.state.profile.username}`;
      website = this.state.profile.website;
      about = this.state.profile.about;
      location = this.state.profile.location;
      balance = this.state.profile.estimated_balance;
    }

    return (
      <div className="g-main_i container">
        <div className="g-content col-xs-12 clearfix" id="workspace">
          <div className="row">
            <div className="col-xs-12 col-md-4 col-lg-3">
              <div className="user-information">
                <div className="pic-wrap clearfix">
                  <AvatarComponent src={profileImageSrc} />
                  { this.state.showFollow ? <FollowComponent item={this.state.profile} /> : null }
                </div>
                <div className="name">{name}</div>
                <div className="location">{location}</div>
                <p>{about}</p>
                <p>
                  <a href={website}>{website}</a>
                </p>
                <div className="amount">
                  <div className="count">$ {balance}</div>
                  <div className="description">This is the current amount of funds in your account in the application.</div>
                </div>
              </div>
            </div>
            <div className="col-xs-12 col-md-8 col-lg-9 position--unset">
              <div className="user-tabs">
                <TabsFilterComponent
                  ref={ref => this.filterNav = ref}
                  keys={this.state.keys}
                  activeItemIndex={this.state.activeItemIndex}
                  updateCallback={this.updateActiveTab.bind(this)}
                />
                {
                  this.state.profile == undefined
                  ?
                    null
                  :
                    <TabsWrapper
                      activeTab={this.state.activeItemIndex}
                    >
                      <ItemsComponent
                        point={this.state.itemsPoint}
                        wrapperModifier="posts-list clearfix type-2"
                        forceRefresh={this.state.needsForceRefresh}
                        clearPostHeader={true}
                      />
                      <UsersComponent
                        point={this.state.followersPoint}
                        usersLabel={Constants.USERS_FILTERS.FOLLOWERS.label}
                        wrapperModifier="posts-list clearfix type-2"
                        getUsers={getFollowers}
                        forceRefresh={this.state.needsForceRefresh}
                      />
                      <UsersComponent
                        point={this.state.followingPoint}
                        usersLabel={Constants.USERS_FILTERS.FOLLOWING.label}
                        wrapperModifier="posts-list clearfix type-2"
                        getUsers={getFollowing}
                        forceRefresh={this.state.needsForceRefresh}
                      />
                    </TabsWrapper>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    localization : state.localization,
    user : state.auth.user
  };
};

export default withRouter(connect(mapStateToProps)(UserProfile));
