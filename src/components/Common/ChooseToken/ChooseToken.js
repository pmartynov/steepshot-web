import React from 'react';
import {connect} from 'react-redux';
import GrayInput from '../GrayInput/GrayInput';
import {changeAmount, setToken} from '../../../actions/wallet';
import ContextMenu from '../ContextMenu/ContextMenu';
import {closeContextMenu, openContextMenu} from '../../../actions/contextMenu';
import FilterRow from '../../Wallet/TransactionHistory/TransactionFilter/FilterRow/FilterRow';
import './chooseToken.css';

const ChooseToken = ({selectedItemNumber, tokensAmount, changeAmount, tokensNames, label, value, reference, onFocus,
                       error, openContextMenu, closeContextMenu, pointContextMenu, setToken}) => {

  function useMaxAmount() {
    changeAmount(tokensAmount);
  }

  function onChangeAmount(e) {
    changeAmount(e.target.value);
  }

  function openSelectToken(e) {
    e.stopPropagation();
    openContextMenu(pointContextMenu)
  }

  function onClickForMenuItem(index) {
    closeContextMenu(pointContextMenu);
    if (selectedItemNumber !== index) {
      setToken(index);
    }
  }

  return (
		<div className="container_choose-token">
			<div className="relative-wrapper_choose-token">
				<GrayInput label={label} placeholder="e.g. 100" onChange={onChangeAmount} value={value} ref={reference}
									 onFocus={onFocus} error={error} maxLength={12}/>
				<div className="token-amount_power-form"
						 onClick={openSelectToken}>
					<div className="balance_power-form">Balance: {tokensAmount}</div>
					<div className="wrapper-choose-token_choose-token">
						<div className="choose-token_choose-token">{tokensNames[selectedItemNumber]}</div>
						<div className="choose-border_choose-token"/>
						<div className="choose-arrows_choose-token"/>
					</div>
				</div>
				<ContextMenu point={pointContextMenu} style={{borderRadius: 10, right: 0}}>
					<div className="container_trx-filter">
            {tokensNames.map((token, index) =>
							<FilterRow
								key={index}
								isActive={index === selectedItemNumber}
								label={token}
								onClick={() => {onClickForMenuItem(index)}}
							/>
            )}
					</div>
				</ContextMenu>
			</div>
			<div onClick={useMaxAmount} className="btn btn-cancel btn-cancel-20_power-form">MAX</div>
		</div>
  );
};

const mapStateToProps = () => {
  const pointContextMenu = 'chooseToken';
  return {
    pointContextMenu
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeAmount: value => {
      dispatch(changeAmount(value))
    },
    openContextMenu: point => {
      dispatch(openContextMenu(point))
    },
    closeContextMenu: point => {
      dispatch(closeContextMenu(point))
    },
    setToken: token => {
      dispatch(setToken(token));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseToken);