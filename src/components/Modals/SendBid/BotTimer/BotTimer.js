import React from 'react';
import Timer from '../../../Common/Timer/Timer';
import {loadingEllipsis} from '../../../../utils/loadingEllipsis';
import './botTimer.css';

const BotTimer = ({isRead, isBlocked, upvoteTime, tick}) => {
	if (isBlocked) {
		return (
			<div className="container_bot-timer checking_bot-timer centered--flex">
				{loadingEllipsis('Checking bot\'s info')}
			</div>
		)
	}

	return (
		<div className="container_bot-timer centered--flex">
			Expected upvote time&nbsp;
			<Timer
				waitingTime={upvoteTime}
				staticTimer={true}
				onTick={tick}
				className={isRead ? 'red_bot-timer' : ''}
			/>
		</div>
	);
};

export default BotTimer;