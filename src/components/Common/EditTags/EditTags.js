import React from 'react';
import './editTags.css';
import Utils from '../../../utils/Utils';

class EditTags extends React.Component {

	onChange(event) {
		let newValue = Utils.cloneObject(event.target.value);
		this.props.onChange(newValue);
	}

	removeTag(index) {
		this.props.onChange(index);
	}

	renderTags() {
		let tagsList = this.props.value.toLowerCase().split(' ');
		return tagsList.map((tag, index) => {
			if (tag === 'steepshot') {
				return null;
			}
			return (
				<div className="tag_edi-tag" key={index}>
					<div className="text_edi-tag">
						{Utils.detransliterate(tag)}
					</div>
					<div className="remove-btn_edi-tag" onClick={this.removeTag.bind(this, index)}/>
				</div>
			)
		});
	}

	render() {
		if (Utils.isEmptyString(this.props.value) || this.props.value === 'steepshot') {
			return null;
		}
		return (
			<div className="container_edi-tag">
				{this.renderTags.bind(this)()}
			</div>
		);
	}
}

export default EditTags;
