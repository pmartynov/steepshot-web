const Constants = {
	SERVICES: {
		golos: {
			name: 'golos',
			baseUrl: 'https://golos.steepshot.org/api/v1_1',
			loggingUrl: 'https://golos.steepshot.org/api/v1',
			MAX_ACCEPTED_PAYOUT: '1000000.000 GBG',
			PERCENT_STEEM_DOLLARS: 10000,
			TAGS: {
				MAX_LENGTH: 40,
				MAX_AMOUNT: 5
			},
			tokensNames: [
				'GOLOS', 'GBG'
			]
		},
		steem: {
			name: 'steem',
			baseUrl: 'https://steepshot.org/api/v1_1',
			loggingUrl: 'https://steepshot.org/api/v1',
			MAX_ACCEPTED_PAYOUT: '1000000.000 SBD',
			PERCENT_STEEM_DOLLARS: 10000,
			TAGS: {
				MAX_LENGTH: 40,
				MAX_AMOUNT: 20
			},
			tokensNames: [
				'STEEM', 'SBD'
			]
		},
		BOTS: {
			BOTS_INFO: 'https://steembottracker.net/bid_bots',
			BOOTS_TOKENS_COURSES: 'https://postpromoter.net/api/prices',
			MIN_BID_VALUE: 0.5,
			MAX_BID_VALUE: 100,
			BOT_UPDATE_TIME: 80,
			SUPPORTABLE_BOTS_LIST: ['promobot', 'upme', 'therising', 'upmewhale', 'rocky1', 'boomerang', 'appreciator',
				'postpromoter', 'smartsteem', 'spydo', 'booster', 'emperorofnaps', 'jerrybanfield']
		}
	},

	OPERATIONS: {
		COMMENT: 'comment',
		VOTE: 'vote',
		POST: 'post',
		FOLLOW: 'follow',
		COMMENT_OPTIONS: 'comment_options',
		FLAG: 'flag'
	},

	NO_AVATAR: '/images/person.png',
	DEF_AVATAR_SIZE: 30,
	USER_CARD_AVATAR_SIZE: 60,
	USER_PROFILE_AVATAR_SIZE: 100,

	NO_IMAGE: '/images/noimage.jpg',
	DEF_POST_SIZE: 300,

	SETTINGS: {
		FIELDS: {
			show_low_rated: 'show_low_rated',
			show_nsfw: 'show_nsfw',
			comment: 'comment',
			upvote: 'upvote',
			upvote_comment: 'upvote_comment',
			follow: 'follow',
			post: 'post',
		},
		DEFAULT: {
			show_low_rated: false,
			show_nsfw: false,
			comment: true,
			upvote: true,
			upvote_comment: true,
			follow: true,
			post: true
		}
	},

	IMAGE: {
		MIN_WIDTH: 640,
		MIN_HEIGHT: 480,
		MAX_WIDTH: 1920,
		MAX_HEIGHT: 1200,
		MAX_SIZE: 1000000
	},

	EMPTY_QUERY: 'It\'s very strange, but we do not have anything yet for this query. Try to look for something else...',

	SEARCH_PLACEHOLDER: 'Type your search query and press "Enter"',
	SEARCH_PLACEHOLDER_MIN: 'To search, press "Enter"',

	WRONG_FILE_FORMAT: 'Unsupported file format. Please try another one.',

	POSTS_FILTERS: {
		POSTS_TOP: {
			label: 'Top',
			point: 'posts/top' //Can be updated by category
		},
		POSTS_HOT: {
			label: 'Hot',
			point: 'posts/hot' //Can be updated by category
		},
		POSTS_NEW: {
			label: 'New',
			point: 'posts/new' //Can be updated by category
		},
		POSTS_USER_FEED: {
			label: 'Feed',
			point: 'recent'
		},
		POSTS_USER: {
			label: 'Posts',
			point: 'user/posts' //Should been updated by username
		}
	},

	USERS_FILTERS: {
		FOLLOWERS: {
			label: 'Followers',
			point: 'user/followers' //Should been updated by username
		},
		FOLLOWING: {
			label: 'Following',
			point: 'user/following' //Should been updated by username
		}
	},

	SEARCH_FILTERS: {
		USERS: {
			label: 'Users',
			point: 'user/search'
		},
		CATEGORIES: {
			label: 'Tag',
			point: 'categories/search'
		}
	},

	SEARCH_HEADING_LABELS: {
		USERS_RESULT: 'User search results for ',
		NEW_POSTS_RESULT: 'New posts by tag ',
		HOT_POSTS_RESULT: 'Hot posts by tag '
	},

	ENDLESS_SCROLL: {
		DEBOUNCE: 500,
		OFFSET: 1500
	},

	TUTORIAL: {
		PRE_TEXT: 'Also you can check ',
		TEXT: 'how to sign in to Steepshot',
		LINK: 'https://www.youtube.com/embed/XAVapBwbS1U?autoplay=1'
	},

	BROWSE_ROUTES: {
		hot: 0,
		new: 1,
		top: 2,
		0: 'hot',
		1: 'new',
		2: 'top'
	},

	TEXT_INPUT_POINT: {
		TITLE: 'title',
		TAGS: 'tags',
		DESCRIPTION: 'description',
		COMMENT: 'comment',
		COMMENT_INPUT_ACTIVE_CLASS: 'focused_tex-inp',
		NAME: 'name',
		POSTING_KEY: 'postingKey'
	},

	KEYS: {
		SPACE: 32,
		ENTER: 13
	},

	DELETE: {
		PUTATIVE_DELETED_POST: 'https://steemitimages.com/DQmd4wyZvtAUifJDLZD9vaqek17S1cUhN3PyEbFMMMgLW8o/Steepshot_footer2.PNG',
		DELETE_POST_SUCCESS: 'The post has been successfully deleted. If you still see your post, please give it a few minutes to sync from the blockchain.',
		DELETE_COMMENT_SUCCESS: 'The comment has been successfully deleted. If you still see your comment, please give' +
		' it a few minutes to sync from the blockchain.',
	},

	POST_SUCCESSFULLY_CREATED: 'Post has been successfully created. If you don\'t see the post in your profile, '
	+ 'please give it a few minutes to sync from the blockchain.',
	POST_SUCCESSFULLY_UPDATED: 'Post has been successfully updated. If you don\'t see the updated post in your profile, '
	+ 'please give it a few minutes to sync from the blockchain.',

	COMMENT_ERROR_MESSAGE: 'You can only create comments once per 20 seconds.',
	COMMENT_SUCCESS_MESSAGE: 'Comment has been successfully added.',
	COMMENT_EDIT_SUCCESS_MESSAGE: 'Comment has been successfully updated. If you don\'t see the updated comment in ' +
	'this post, please give it a few minutes to sync from the blockchain.',

	SETTINGS_CHANGED_MESSAGE: 'Settings has been successfully changed.',
	SETTINGS_NOT_CHANGED_MESSAGE: 'Settings hasn\'t been changed.',

	EMPTY_FIELD: 'This field can\'t be empty.',

	VOTE_ACTION_WHEN_NOT_AUTH: 'This action is only available for logged-in users.',
	VOTE_ACTION_WHEN_NOT_AUTH_DEBOUNCE: 500,
	AUTH_WRONG_USER: 'Such user doesn\'t exist.',
	AUTH_WRONG_POSTING_KEY: 'Invalid posting key.',
	NON_BASE58_CHARACTER: 'Non-base58 character',

	FOLLOW_REQUEST_ERROR: 'Something went wrong, please, try again later.',
	OOOPS_SOMETHING_WRONG: 'Ooops, something went wrong.',

	POST_DESRIPTION_MAXLENGTH: 120,
	POST_LIKED_BY: 'Post has been rated by these users',

	WAIT_FINISHING_TRANSACTION: 'There\'s unfinished transaction, please wait.',

	MAX_TAGS_NUMBER: 'You have reached the max number of tags.',

	ONE_SIGNAL: {
		APP_ID: '77fa644f-3280-4e87-9f14-1f0c7ddf8ca5',
		STATES: {
			DEFAULT: 'default',
			GRANTED: 'granted',
			DENIED: 'denied'
		}
	},

	BLOCKCHAIN: {
		golos: {
			CONNECTION_SERVERS: [
				"wss://ws.golos.io"
			],
			PREFIX: 'GLS',
			CHAIN_ID: '782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12'
		},

		steem: {
			CONNECTION_SERVERS: [
				//'https://steemd.steepshot.org', don't working
				'https://api.steemit.com',
				//'https://api.steemitstage.com' don't working
			]
		}
	},

	GIF: {
		SIZE_ERROR: 'Size of your *.gif should be less than 1 MB.'
	},

	WINDOW: {
		MAX_MOBILE_SCREEN_WIDTH: 1023,
		MOBILE_START_WIDTH: 815,
		WIDE_SCREEN_WIDTH: 1362
	},

	PROMOTE: {
		INPUT_ERROR: 'Enter correct value.',
		MIN_AMOUNT_ERROR: 'Min bid is 0.5.',
		MAX_AMOUNT_ERROR: 'Max bid is 100.',
		FIND_BOT_ERROR: 'We look, but there\'s no appropriate bot for promotion. Please, try little later.',
		BID_TIMEOUT_ERROR: 'It\'s too late to bid to this bot, try any one.',
		RED_TIMER: 60,
		BLOCKED_TIMER: 21,
		BID_TO_BOT_SUCCESS: 'Your bid has been successfully sent. Wait for upvote.',
	},

	TRANSFER: {
		BID_TO_BOT_SUCCESS: 'Your bid has been successfully sent.',
		TRANSFER_SUCCESS: 'Transfer has been successfully concluded.',
		MIN_AMOUNT: 0.001,
		MIN_LEAVE_STEEM_POWER: 5
	},

	WALLET: {
		POWER_UP_SUCCESS: 'Power up success.',
		POWER_DOWN_SUCCESS: 'Started power down.'
	},

	ERROR_MESSAGES: {
		INVALID_ACTIVE_KEY: 'Invalid active key.',
		USER_NOT_FOUND: 'User not found!',
		NOT_ENOUGH_TOKENS: 'There\'s not enough tokens!'
	},

	MILLISECONDS_IN_DAY: 24 * 60 * 60 * 1000,
	MILLISECONDS_IN_SECOND: 1000,
	CASHOUT_PERIOD: 7
};


export default Constants;