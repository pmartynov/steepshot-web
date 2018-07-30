import React from 'react';
import {connect} from 'react-redux';
import './transactionFilter.css';
import ContextMenu from '../../../Common/ContextMenu/ContextMenu';
import {closeContextMenu, openContextMenu} from '../../../../actions/contextMenu';
import SettingsButton from '../SettingsButton/SettingsButton';
import FilterRow from './FilterRow/FilterRow';

const TransactionFilter = ({filter, current, onChange, pointContextMenu, openContextMenu, closeContextMenu, show}) => {
	return (
		<div className="component_trx-filter">
			<SettingsButton active={show}
			                onClick={(e) => {
				                e.stopPropagation();
				                openContextMenu(pointContextMenu)
			                }}
			/>
			<ContextMenu point={pointContextMenu} left="-160px" top="5px" style={{borderRadius: 10}}>
				<div className="container_trx-filter">
					{filter.map((operation, index) =>
						<FilterRow
							key={index}
							isActive={index === current}
							label={operation}
							onClick={() => {
								closeContextMenu(pointContextMenu);
								if (current !== index) {
									onChange(index);
								}
							}}
						/>
					)}
				</div>
			</ContextMenu>
		</div>
	)
};

const mapStateToProps = (state) => {
	const pointContextMenu = "transactions-filters";
	const contextMenuState = state.contextMenu[pointContextMenu] || {};
	const {show} = contextMenuState;
	return {
		pointContextMenu,
		show,
		filter: state.transactionHistory.operationLabel
	}
};

const mapDispatchToProps = dispatch => {
	return {
		openContextMenu: point => {
			dispatch(openContextMenu(point))
		},
		closeContextMenu: point => {
			dispatch(closeContextMenu(point))
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionFilter);