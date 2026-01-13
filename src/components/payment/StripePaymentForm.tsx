import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Replace with your actual publishable key from env
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
// Avoid initializing with empty string to prevent console error
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripeFormProps {
    clientSecret: string;
    onSuccess: () => void; // Called when payment succeeds
    onError: (msg: string) => void;
    amount: number;
}

const CheckoutForm = ({ onSuccess, onError, amount }: Omit<StripeFormProps, 'clientSecret'>) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is required for some payment methods, but for card usually we handle inline if redirect: 'if_required'
                // However, standard flow suggests a return_url. We'll set it to current page or specific success page.
                return_url: window.location.origin + '/donation-success',
            },
            redirect: 'if_required',
        });

        if (error) {
            setLoading(false);
            onError(error.message || 'Payment failed');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setLoading(false);
            onSuccess();
        } else {
            // Unexpected state
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
            >
                {loading ? 'Processing...' : `Pay $${amount}`}
            </Button>
        </form>
    );
};

export const StripePaymentForm: React.FC<StripeFormProps> = ({ clientSecret, onSuccess, onError, amount }) => {
    if (!clientSecret) return null;

    if (!clientSecret || !stripePromise) return null;

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onSuccess={onSuccess} onError={onError} amount={amount} />
        </Elements>
    );
};
