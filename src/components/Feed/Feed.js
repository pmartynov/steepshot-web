import React from 'react';
import Constants from '../../common/constants';
import {documentTitle} from '../../utils/documentTitle';
import PostsList from '../PostsList/PostsList';
import {addMetaTags, getDefaultTags} from "../../actions/metaTags";
import {withWrapper} from "create-react-server/wrapper";

class Feed extends React.Component {

	static async getInitialProps({location, req, res, store}) {
		if (!req || !location || !store) {
			return {};
		}
		await store.dispatch(addMetaTags(getDefaultTags(req.hostname, location.pathname)));
		return {};
	}

	componentDidMount() {
		documentTitle();
	}

	render() {
		if (global.isServerSide) {
			return null;
		}
		return (
			<div className="g-main_i container">
				<div id="workspace" className="g-content clearfix">
					<PostsList
						point={Constants.POSTS_FILTERS.POSTS_USER_FEED.point}
						wrapperModifier="posts-list clearfix"
					/>
				</div>
			</div>
		);
	}
}


export default withWrapper(Feed);
