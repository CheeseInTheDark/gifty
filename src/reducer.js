const INITIAL_STATE = { 
    recipient: undefined,
    loading: false
}

module.exports = function reduce(state = INITIAL_STATE, action) {
    switch (action.type) {
        case '': 
            return Object.assign({}, state, { posts: action.value }) 
    }
    return state
}