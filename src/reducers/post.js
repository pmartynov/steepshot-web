const initialState = {
    posts: []
};

export default function post(state = initialState, action) {
    switch (action.type) {
        case 'GET_POST_SUCCESS':
            return Object.assign({}, state, {
                posts: action.posts
            });
        case 'GET_POSTS__FAILURE':
            return state;

        case 'START_REQUEST':
            return Object.assign({}, state, {
              posts: state.posts.map((post, index) => {
                if (index === action.index) {
                  return Object.assign({}, post, {
                    isPostDeleting: true
                  });
                }
                return post;
              })
            });
        case 'RESOLVE_RESPONSE':
            return Object.assign({}, state, {
                posts: state.posts.map( (post, index) => {
                    if (index == action.index) {
                        state.posts.splice(index, 1);
                    }
                })
            });
        case 'REJECT_RESPONSE':
          return Object.assign({}, state, {
            posts: state.posts.map((post, index) => {
              if (index === action.index) {
                return Object.assign({}, post, {
                  isPostDeleting: false
                });
              }
              return post;
            })
          });
        default:
            return state;
    }
}
