export default function (state, { type, payload }) {
    switch (type) {

        case 'SET_VALUE':
            return {
                ...state,
                [payload.key]: payload.value,
            }
        default:
            return state
    }
}