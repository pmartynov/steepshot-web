import React from 'react';
import './transactionHistory.css';
import {connect} from 'react-redux';
import Transaction from './Transaction/Transaction';
import TransactionFilter from './TransactionFilter/TransactionFilter';
import InfinityScroll from '../../InfinityScroll/InfinityScroll';
import ShowIf from '../../Common/ShowIf';
import LoadingSpinner from '../../LoadingSpinner';
import {changeTransactionFilter, getTransactionHistory} from '../../../actions/transactionHistory';

class TransactionHistory extends React.Component {

	constructor(props) {
		super();
		props.getTransactionHistory();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.indexOperation !== this.props.indexOperation) {
			this.props.getTransactionHistory(true);
		}
	}

	renderTransaction(transactions) {
		let result = transactions.map((trx, index) =>
			<Transaction operation={trx[1].op[0]}
			             data={trx[1].op[1]}
			             key={index}
			             index={index}
			             date={trx[1].timestamp}
			             isMobileScreen={this.props.isMobileScreen}
			             isExtraSmall={this.props.isExtraSmall}
			/>
		);
		return result;
	}

	render() {
		const {getTransactionHistory, hasMore, transactions, loading, indexOperation} = this.props;
		return (
			<InfinityScroll
				point='body'
				fetch={getTransactionHistory}
				hasMore={hasMore && (transactions.length > 0)}>
				<div className="container_trx-history">
					<div className="header_trx-history">
						<div className="info_trx-history">
							<div className="title_trx-history">
								Transaction history
							</div>
							<div className="description_trx-history">
								Beware of spam and phishing links in programs. Do not open links from users you do not trust. Do not
								provide your personal keys to third parties.
							</div>
						</div>
						<TransactionFilter current={indexOperation} onChange={this.props.changeTransactionFilter}/>
					</div>
					{this.renderTransaction(transactions)}
					<ShowIf show={loading}>
						<LoadingSpinner style={{padding: '20px', backgroundColor: '#fbfbfb'}}/>
					</ShowIf>
				</div>
			</InfinityScroll>
		);
	}
}

const mapStateToProps = state => {
	const {loading, transactions, hasMore, indexOperation} = state.transactionHistory;
	return {
		loading,
		transactions,
		hasMore,
		indexOperation,
		isMobileScreen: state.window.isMobileScreen,
		isExtraSmall: state.window.width <= 530
	}
};

const mapDispatchToProps = dispatch => {
	return {
		getTransactionHistory: (changedFilter) => {
			dispatch(getTransactionHistory(changedFilter))
		},
		changeTransactionFilter: (indexOperation) => {
			dispatch(changeTransactionFilter(indexOperation))
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionHistory);
