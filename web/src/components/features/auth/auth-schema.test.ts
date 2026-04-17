import { authSchema } from './auth-schema'

describe('authSchema', () => {
    it('accepts valid email and password', () => {
        const out = authSchema.parse({
            email: 'user@example.com',
            password: 'password123',
        })
        expect(out.email).toBe('user@example.com')
    })

    it('rejects invalid email', () => {
        expect(() =>
            authSchema.parse({ email: 'not-an-email', password: 'password123' })
        ).toThrow(/invalid email address/i)
    })

    it('rejects short password', () => {
        expect(() =>
            authSchema.parse({ email: 'user@example.com', password: 'short' })
        ).toThrow(/password must be at least 8 characters/i)
    })
})
