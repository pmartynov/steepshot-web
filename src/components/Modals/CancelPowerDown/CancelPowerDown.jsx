import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import SteemService from '../../../services/SteemService';
import {closeModal} from '../../../actions/modal';
import {cancelPowerDown} from '../../../actions/wallet';
import InputActiveKey from '../../Common/InputActiveKey/InputActiveKey';

const Wrapper = styled.div`
  width: 460px;
  max-width: 100vw;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 25px 30px 20px 30px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  font: 14px OpenSans-Bold;
  
  @media (max-width: 400px) {
    font: 12px OpenSans-Bold;
  }
  
  @media (max-width: 350px) {
    flex-direction: column;
    
    & div:first-child {
      margin-bottom: 20px;
    }
  }
`;

const Title = styled.div`
  color: #0f181e;
  text-transform: uppercase;
`;

const LinkToUser = ({className, children, user}) => {
  return (
    <Link to={`/@${user}`} className={className}>
      {children}
    </Link>
  )
};

const StyledLinkToUser = styled(LinkToUser)`
  color: #e74800; 
  
  &:hover {
    opacity: .6;
  }
`;

const AmountField = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-top: 1px solid #f4f4f6;
  border-bottom: 1px solid #f4f4f6;
`;

const AmountSpan = styled.span`
  font: 14px OpenSans-Regular; 
  color: #e74800;
`;

const BottomAmountField = AmountField.extend`
  border-top: 0
`;

const ScaleBlock = styled.div`
  padding: 30px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PercentsWrapper = styled.div`
  position: relative; 
  height: 30px;
  width: 330px;
  overflow: hidden;
  border-radius: 15px;
  border: 1px solid #f4f4f6;
  background-color: #fafafa;
  
  &::before {
    content: '';
    position: absolute;
    z-index: 2;
    border: 1px solid #fafafa;
    border-radius: 15px;
    height: 28px;
    width: 100%;
  }
`;

const PercentsSpan = styled.div`
  color: #0f181e;
  font: 14px OpenSans-SemiBold;
  margin-left: 14px;
  min-width: 55px;
  text-align: right;
`;

const ScaleFill = styled.div`
  position: absolute;
  z-index: 1;
  top: 50%;
  ${({mobileOutScaleFillWidth, powerInPercents}) => (
    `margin-left: calc(-1 * (326px - (326px * ${powerInPercents} / 100)));
     left: ${powerInPercents > 0 ? '1px' : '0'}
     transform: translateY(-50%);
     height: 26px;
     border-radius: 15px;
     width: 326px;
     background-image: linear-gradient(96deg, #ff7904, #ff1605);
     box-shadow: 0 10px 20px 0 rgba(231, 72, 0, 0.3);
     
     @media (max-width: 460px) {
       width: calc(100vw - ${mobileOutScaleFillWidth});
       margin-left: calc(-1 * ((100vw - ${mobileOutScaleFillWidth}) - ((100vw - ${mobileOutScaleFillWidth}) * 
       ${powerInPercents} / 100)));
    }`
  )}
 `;

const ButtonsHolder = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  
  & button:first-child {
    margin-right: 10px;
  }
  
  @media (max-width: 431px) {
      flex-direction: column;
      
      & button:first-child {
        margin: 0 0 10px 0;
      }
  }
`;

const ActiveKeyField = styled(InputActiveKey)`
  padding: 20px 0 10px 0;
  border-bottom: 1px solid #f4f4f6;
`;

class CancelPowerDown extends React.Component {

  render() {
    const {user, requestedPower, payedPower, remainedPayout, powerInPercents, closeModal, cancelPowerDown,
      isSteemPowerCut, mobileOutScaleFillWidth} = this.props;
    let steemPowerInscription = 'STEEM POWER';
    if (isSteemPowerCut) {
      steemPowerInscription = 'SP'
    }
    return (
      <Wrapper>
        <Header>
          <Title>
            Power down progression
          </Title>
          <StyledLinkToUser user={user}>
            @{user}
          </StyledLinkToUser>
        </Header>
        <AmountField>
          Reqested
          <AmountSpan>
            {requestedPower} {steemPowerInscription}
          </AmountSpan>
        </AmountField>
        <ScaleBlock>
          <PercentsWrapper>
            <ScaleFill powerInPercents={powerInPercents} mobileOutScaleFillWidth={mobileOutScaleFillWidth}/>
          </PercentsWrapper>
          <PercentsSpan>
            {powerInPercents} %
          </PercentsSpan>
        </ScaleBlock>
        <AmountField>
          Powered down
          <AmountSpan>
            {payedPower} STEEM
          </AmountSpan>
        </AmountField>
        <BottomAmountField>
          Remaining
          <AmountSpan>
            {remainedPayout} {steemPowerInscription}
          </AmountSpan>
        </BottomAmountField>
        <ActiveKeyField/>
        <ButtonsHolder>
          <button className="btn btn-cancel" onClick={closeModal}>CLOSE</button>
          <button className="btn btn-default" onClick={cancelPowerDown}>CANCEL POWER DOWN</button>
        </ButtonsHolder>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  const {to_withdraw, withdrawn} = state.wallet;
  const toWithdraw = (SteemService.vestsToSp(to_withdraw) / 1000000);
  const withdranPower = withdrawn ? (SteemService.vestsToSp(withdrawn) / 1000000) : 0;
  const requestedPower = (toWithdraw + withdranPower).toFixed(3);
  const powerInPercents = parseFloat((withdranPower * 100 / requestedPower).toFixed(1));
  const mobileOutScaleFillWidth = (30 * 2 + 55 + 14 + 4) + 'px';
  return {
    isSteemPowerCut: state.window.width <= 400,
    user: state.auth.user,
    payedPower: withdranPower.toFixed(3),
    remainedPayout: (requestedPower - withdranPower).toFixed(3),
    mobileOutScaleFillWidth,
    requestedPower,
    powerInPercents
  };
};

const mapDispatchToProps = dispatch => {
  return {
    closeModal: () => {
      dispatch(closeModal("CancelPowerDown"))
    },
    cancelPowerDown: () => {
      dispatch(cancelPowerDown())
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CancelPowerDown);