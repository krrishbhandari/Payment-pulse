import { useState } from 'react';
import { Customer } from '../lib/supabase';
import { Send, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { sendImmediateReminder } from '../services/followUpService';

const COLORS = {
    primary: '#1b4079',
    secondary: '#4d7c8a',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    dark: '#0a1931',
};

interface PaymentActionsProps {
    customer: Customer;
    onActionComplete?: () => void;
}

export default function PaymentActions({ customer, onActionComplete }: PaymentActionsProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSendReminder = async (channel: 'email') => {
        setLoading(true);
        setMessage(null);

        try {
            const success = await sendImmediateReminder(customer, channel);

            if (success) {
                setMessage({
                    type: 'success',
                    text: `✅ Gmail draft opened! Please click SEND in the new window.`
                });
                onActionComplete?.();
            } else {
                setMessage({ type: 'error', text: `Failed to open Gmail` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while sending reminder' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Send Reminder Section */}
            <div
                className="rounded-xl p-4 border"
                style={{
                    backgroundColor: `${COLORS.secondary}05`,
                    borderColor: `${COLORS.secondary}20`,
                }}
            >
                <h3 className="font-bold mb-3 flex items-center space-x-2" style={{ color: COLORS.dark }}>
                    <Send className="w-5 h-5" style={{ color: COLORS.secondary }} />
                    <span>Send Payment Reminder</span>
                </h3>

                <p className="text-sm mb-3" style={{ color: COLORS.secondary }}>
                    Send automated payment reminder to customer via their preferred channel
                </p>

                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => handleSendReminder('email')}
                        disabled={loading || !customer.email}
                        className="px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 flex flex-col items-center space-y-2"
                        style={{
                            backgroundColor: `${COLORS.primary}15`,
                            border: `1px solid ${COLORS.primary}30`,
                            color: COLORS.primary,
                        }}
                    >
                        <Mail className="w-6 h-6" />
                        <span className="text-sm font-semibold">Send Email Reminder</span>
                    </button>
                </div>

                {!customer.email && !customer.phone && (
                    <p className="text-xs mt-3 text-center" style={{ color: COLORS.danger }}>
                        ⚠️ Customer has no email or phone number on file
                    </p>
                )}
            </div>

            {/* Message Display */}
            {message && (
                <div
                    className="flex items-center space-x-2 rounded-lg p-3 border"
                    style={{
                        backgroundColor: message.type === 'success' ? `${COLORS.success}10` : `${COLORS.danger}10`,
                        borderColor: message.type === 'success' ? `${COLORS.success}30` : `${COLORS.danger}30`,
                        color: message.type === 'success' ? COLORS.success : COLORS.danger,
                    }}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="font-semibold text-sm">{message.text}</span>
                </div>
            )}
        </div>
    );
}
