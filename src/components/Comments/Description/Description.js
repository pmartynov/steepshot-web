import React from 'react';
import {connect} from 'react-redux';
import Tags from '../../PostsList/Post/Tags/Tags';
import './description.css';
import ShowIf from '../../Common/ShowIf';
import PromoteModal from '../../Modals/Promote/Promote';
import {openModal} from '../../../actions/modal';
import MarkdownParser from '../../../utils/markdownParser';
import renderHTML from 'react-render-html';
import ChainService from '../../../services/ChainService';

class Description extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isDescriptionOpened: false
		}
	}

	openDescription() {
		this.setState({
			isDescriptionOpened: true
		});
	}

	openPromoteModal() {
		let modalOption = {
			body: <PromoteModal index={this.props.postIndex}/>
		};
		this.props.openModal("PromoteModal", modalOption);
	}

	render() {
		return (
			<div className="container_description">
				<ShowIf show={this.props.isSelfPost && !this.props.isGolos && !this.props.oldForPromote}>
					<div className="open-promote_description centered--flex" onClick={this.openPromoteModal.bind(this)}>
						PROMOTE THIS POST
					</div>
				</ShowIf>
				<p className="word-wrap_brake-word">{renderHTML(MarkdownParser.parseTitle(this.props.title))}</p>
				<div className={(this.state.isDescriptionOpened || (this.props.description.length < 140))
					? 'collapse-opened' : 'collapse-closed'}>
					{renderHTML(MarkdownParser.parse(this.props.description))}
					<Tags tags={this.props.tags}/>
					<a className="lnk-more" onClick={this.openDescription.bind(this)}>Show more</a>
				</div>
			</div>);
	}
}


const mapStateToProps = (state) => {
	const postIndex = state.postModal.currentIndex;
	const post = state.posts[postIndex];
	return {
		postIndex,
		isGolos: ChainService.usingGolos(),
		isSelfPost: state.auth.user === post.author,
		oldForPromote: post.postAge > 4
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		openModal: (index, option) => {
			dispatch(openModal(index, option));
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Description);
