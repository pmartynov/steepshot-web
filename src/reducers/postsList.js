const initialState = {
  posts: {},
};

export default function postsList(state = initialState, action) {
  switch (action.type) {
    case 'INIT_POSTS_LIST':
      return Object.assign({}, state, {
        [action.options.point]: action.options,
      });
    case 'GET_POSTS_LIST_REQUEST':
      return Object.assign({}, state, {
        [action.point]: Object.assign({}, state[action.point], {
          loading: true,
        }),
      });
    case 'GET_POSTS_LIST_SUCCESS':
      console.log(Object.assign({}, state));
      return Object.assign({}, state, {
        [action.options.point]: Object.assign({}, state[action.options.point], {
          postsIndices: [
            ...state[action.options.point].postsIndices,
            ...action.options.postsIndices],
          offset: action.options.offset,
          hasMore: action.options.hasMore,
          loading: false,
          length: state[action.options.point].length +
          action.options.length,
        }),
      });

    default:
      return state;
  }
}
