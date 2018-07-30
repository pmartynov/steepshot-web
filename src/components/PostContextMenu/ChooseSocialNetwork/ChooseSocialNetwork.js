import * as React from 'react';
import {
	FacebookIcon,
	FacebookShareButton,
	LinkedinIcon,
	LinkedinShareButton,
	PinterestIcon,
	PinterestShareButton,
	RedditIcon,
	RedditShareButton,
	TwitterIcon,
	TwitterShareButton,
	VKIcon,
	VKShareButton
} from 'react-share';
import './chooseSocialNetwork.css';
import Constants from '../../../common/constants';
import ChainService from '../../../services/ChainService';

class ChooseSocialNetwork extends React.Component {

	closeModal(e) {
		e.stopPropagation();
		this.props.closeModal();
	}

	render() {
		const golosName = Constants.SERVICES.golos.name;
		const isGolosService = ChainService.usingGolos();
		let shareAddress = document.location.origin + (isGolosService ? '/' + golosName : '') + '/post' + this.props.item.url;
		let postTitle = this.props.item.title;
		let crossOffset = {top: 8, right: 5};
		return (
			<div className="wrapper_csn-mod">
				<div className="body_confirm-del-mod position--relative">
					<p className="title_csn-mod">Share post</p>
					<div className="cross-wrapper_menu cross-wrapper_csn"
					     onClick={this.closeModal.bind(this)}
					     style={crossOffset}
					>
						<i className="cross_menu"/>
					</div>
					<div className="share-buttons_csn">
						<div className="soc-network-item_csn">
							<FacebookShareButton url={shareAddress}
							                     hashtag="#steepshot"
							>
								<FacebookIcon size={42} round={true}/>
								<p>Facebook</p>
							</FacebookShareButton>
						</div>
						<div className="soc-network-item_csn">
							<TwitterShareButton url={shareAddress}
							                    title={postTitle}
							                    hashtags={this.props.item.tags}
							>
								<TwitterIcon size={42} round={true}/>
								<p>Twitter</p>
							</TwitterShareButton>
							<div className="custom-border_csn"/>
						</div>
						<div className="soc-network-item_csn">
							<PinterestShareButton url={shareAddress}
							                      description={postTitle}
							                      media={this.props.item.media[0].url}
							>
								<PinterestIcon size={42} round={true}/>
								<p>Pinterest</p>
							</PinterestShareButton>
							<div className="custom-border_csn"/>
						</div>
						<div className="soc-network-item_csn">
							<VKShareButton url={shareAddress}
							               title={postTitle}
							               image={this.props.item.media[0].url}
							>
								<VKIcon size={42} round={true}/>
								<p>VK</p>
							</VKShareButton>
							<div className="custom-border_csn"/>
						</div>
						<div className="soc-network-item_csn">
							<LinkedinShareButton url={shareAddress}
							                     title={postTitle}
							>
								<LinkedinIcon size={42} round={true}/>
								<p>Linkedin</p>
							</LinkedinShareButton>
							<div className="custom-border_csn"/>
						</div>
						<div className="soc-network-item_csn">
							<RedditShareButton url={shareAddress}
							                   title={postTitle}
							>
								<RedditIcon size={42} round={true} iconBgStyle={{fill: 'ff3f18'}}/>
								<p>Reddit</p>
							</RedditShareButton>
							<div className="custom-border_csn"/>
						</div>
					</div>
				</div>
				<div className="footer_csn">
					<p className="text--center">Select social network you want share to</p>
				</div>
			</div>
		);
	}
}


export default ChooseSocialNetwork;
