export default function usersList(state = {}, action) {
  switch (action.type) {
    case 'INIT_USERS_LIST':
      return Object.assign({}, state, {
        [action.options.point]: action.options,
      });
    case 'GET_USERS_LIST_REQUEST':
      return Object.assign({}, state, {
        [action.point]: Object.assign({}, state[action.point], {
          loading: true,
        }),
      });
    case 'CLEAR_USERS':
      return Object.assign({}, state, {
        [action.point]: {}
      });
    case 'GET_USERS_LIST_SUCCESS':
      let usersArr;
      if (action.options.users) {
        usersArr = [...state[action.options.point].users, ...action.options.users];
      } else {
        usersArr = [];
      }
      return Object.assign({}, state, {
        [action.options.point]: Object.assign({}, state[action.options.point], {
          loading : false,
          hasMore : action.options.hasMore,
          users: usersArr,
          offset: action.options.offset,
          loader: false
        }),
      });

    default:
      return state;
  }
}
