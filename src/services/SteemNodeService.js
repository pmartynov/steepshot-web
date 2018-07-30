import steem from 'steem';
import Constants from '../common/constants';

const MAX_COUNT_TRY = 3;
let currentNode = 0;
const NODE_LIST = Constants.BLOCKCHAIN.steem.CONNECTION_SERVERS;


class SteemNodeService {

	static initConfig() {
		steem.api.setOptions({url: NODE_LIST[currentNode]});
	}

	static switchNode() {
		let infoMsg = `switch node from ${NODE_LIST[currentNode]} to `;
		currentNode = (currentNode + 1) % NODE_LIST.length;
		steem.api.setOptions({url: NODE_LIST[currentNode]});
		infoMsg += NODE_LIST[currentNode];
		console.log(infoMsg);
	}

	constructor() {
		this.countTry = 1;
	}

	setNextNode() {
		this.countTry++;
		SteemNodeService.switchNode();
	}

	isMaxCountRequests() {
		return this.countTry >= MAX_COUNT_TRY;
	}
}

export default SteemNodeService;