describe("reducer", () => {

    const subject = require('../reducer')

    const previousState = { oldValue: "old" }
    
    test("returns initial state", () => {
        const state = subject(undefined, {type: undefined})
        
        expect(state).toEqual({
            recipient: undefined,
            loading: false
        })
    })
})