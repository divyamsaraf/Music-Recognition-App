import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from './AuthModal'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    createBrowserSupabaseClient: () => ({
        auth: {
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signInWithOAuth: jest.fn(),
        }
    })
}))

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: jest.fn(),
    })
}))

describe('AuthModal', () => {
    it('should render login form by default', () => {
        render(<AuthModal open={true} onOpenChange={() => { }} />)
        expect(screen.getByRole('tab', { name: /login/i })).toHaveAttribute('data-state', 'active')
        // Use getAllByLabelText because hidden tabs might still be in DOM or transition
        // But Radix unmounts. Let's check if we can find the login button.
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should switch to signup form', async () => {
        const user = userEvent.setup()
        render(<AuthModal open={true} onOpenChange={() => { }} />)

        const signupTab = screen.getByRole('tab', { name: /sign up/i })
        await user.click(signupTab)

        expect(signupTab).toHaveAttribute('data-state', 'active')
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it.skip('should validate email format', async () => {
        render(<AuthModal open={true} onOpenChange={() => { }} />)

        // Target the email input specifically for login
        const emailInput = screen.getByLabelText(/email/i)
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

        const submitBtn = screen.getByRole('button', { name: /sign in/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
        })
    })

    it('should validate password length', async () => {
        render(<AuthModal open={true} onOpenChange={() => { }} />)

        const passwordInput = screen.getByLabelText(/password/i)
        fireEvent.change(passwordInput, { target: { value: 'short' } })

        const submitBtn = screen.getByRole('button', { name: /sign in/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
        })
    })
})
