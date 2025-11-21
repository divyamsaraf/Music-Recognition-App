import '@testing-library/jest-dom'

Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random(),
    },
})

global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
