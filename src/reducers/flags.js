const initialState = {
  flags: [ ],
  updateFlagInComponent: null
};

export default function flag(state = initialState, action) {
  switch (action.type) {
    case 'ADD_FLAG_TO_STATE':
      if (state.flags[action.options.index] !== undefined) {
        return state;
      }
      return Object.assign({}, state, {
        flags: [
          ...state.flags, {
            ...action.options,
          },
        ],
      });
    case 'CLEAR_FLAGS':
      return Object.assign({}, state, {
        flags: []
      });
    case 'TOGGLE_FLAG_REQUEST':
      return Object.assign({}, state, {
        flags: state.flags.map((flag, index) => {
          if (index === action.index) {
            return Object.assign({}, flag, {
              state: !flag.state,
              isFlagLoading: true,
            });
          }
          return flag;
        }),
      });
    case 'TOGGLE_FLAG_FAILURE':
      return Object.assign({}, state, {
        flags: state.flags.map((flag, index) => {
          if (index === action.index) {
            return Object.assign({}, flag, {
              state: !flag.state,
              isFlagLoading: false,
            });
          }
          return flag;
        }),
      });
    case 'TOGGLE_FLAG_SUCCESS':
      return Object.assign({}, state, {
        flags: state.flags.map((flag, index) => {
          if (index === action.index) {
            return Object.assign({}, flag, {
              isFlagLoading: false,
            });
          }
          return flag;
        }),
      });
    case 'ADD_UPDATE_FLAG_IN_COMPONENT_FUNC':
      return Object.assign({}, state, {
        updateFlagInComponent: action.func
      });
    default:
      return state;
  }
}
