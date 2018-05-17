export default function posts(state = {}, action) {
	switch (action.type) {

		case 'GET_POST_COMMENTS_SUCCESS':
		case 'ADDED_NEW_COMMENT':
		case 'GET_POSTS_LIST_SUCCESS':
		case 'ADD_POSTS':
		case 'UPDATE_COMMENT':
			return {
				...state,
				...action.posts
			};

		case 'UPDATE_POST':
			return {
				...state,
				[action.post.url]: action.post,
			};

		case 'TOGGLE_FLAG_REQUEST':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					flag: !state[action.index].flag,
					flagLoading: true,
				}
			};

		case 'POST_PLAY_VIDEO':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					playing: true
				}
			};

		case 'POST_STOP_VIDEO':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					playing: false
				}
			};

		case 'SET_VIDEO_TIME':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					time: action.time
				}
			};

		case 'TOGGLE_FLAG_ERROR':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					flag: !state[action.index].flag,
					flagLoading: false,
				}
			};

		case 'TOGGLE_FLAG_SUCCESS':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					flagLoading: false,
				},
			};

		case 'TOGGLE_VOTE_REQUEST':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					vote: !state[action.index].vote,
					voteLoading: true,
				},
			};

		case 'TOGGLE_VOTE_ERROR':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					vote: !state[action.index].vote,
					voteLoading: false,
				},
			};

		case 'TOGGLE_VOTE_SUCCESS':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					voteLoading: false,
				},
			};

		case 'DELETE_POST_REQUEST':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					postDeleting: true
				}
			};

		case 'DELETE_POST_SUCCESS':
			let copyState = {...state};
			delete copyState[action.index];
			return copyState;

		case 'DELETE_POST_ERROR':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					postDeleting: false
				}
			};
		case 'POWER_OF_LIKE_IND':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					isPLOpen: action.isPLOpen
				}
			};
		case 'POWER_OF_LIKE_TIMEOUT':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					plTimeout: action.plTimeout
				}
			};
		case 'HIDE_POWER_OF_LIKE_TIMEOUT':
			return {
				...state,
				[action.index]: {
					...state[action.index],
					hplTimeout: action.hplTimeout
				}
			};
		case 'SET_SLIDER_TIMEOUT':
			return {
        ...state,
        [action.index]: {
          ...state[action.index],
          sliderWidth: action.sliderWidth
        }
			};
		case 'POWER_OF_LIKE_CHANGE_STATUS':
			return {
        ...state,
        [action.index]: {
          ...state[action.index],
          changeStatus: action.changeStatus
        }
			};
    case 'SET_GALLERY_IMG_INDEX':
      return {
        ...state,
        [action.postIndex]: {
          ...state[action.postIndex],
          imgIndex: action.imgIndex
        }
      };

		default:
			return state;
	}
}
