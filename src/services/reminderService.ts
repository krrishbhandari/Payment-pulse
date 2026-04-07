import { supabase } from '../lib/supabase';
import { Customer } from '../lib/supabase';

export interface ReminderTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    tone: 'friendly' | 'firm' | 'urgent' | 'legal';
    channel: 'email' | 'sms' | 'whatsapp';
    triggerDays: number[];
}

export interface ReminderSchedule {
    customerId: string;
    scheduledDate: Date;
    reminderType: string;
    channel: string;
    status: 'pending' | 'sent' | 'failed';
}

/**
 * Reminder Templates for Different Stages
 */
export const REMINDER_TEMPLATES: ReminderTemplate[] = [
    {
        id: 'friendly_7',
        name: 'Friendly Reminder - 7 Days',
        subject: 'Gentle Reminder: Payment Due',
        body: `Dear {customerName},

This is a friendly reminder that your payment of ₹{amount} is now {daysOverdue} days overdue.

We understand that sometimes payments can slip through the cracks. If you've already made the payment, please disregard this message.

💳 Pay Now: {paymentLink}
📱 UPI: {upiLink}

{discountMessage}

If you're facing any difficulties, please reach out to us. We're here to help!

Best regards,
Payment Pulse Team`,
        tone: 'friendly',
        channel: 'email',
        triggerDays: [7],
    },
    {
        id: 'firm_15',
        name: 'Firm Reminder - 15 Days',
        subject: 'Important: Payment Overdue',
        body: `Dear {customerName},

Your payment of ₹{amount} is now {daysOverdue} days overdue.

⚠️ Please settle this amount immediately to avoid:
• Late payment fees
• Impact on your credit score
• Service interruption

💳 Pay Now: {paymentLink}
📱 Quick Pay via UPI: {upiLink}

{paymentPlanMessage}

Please contact us if you need assistance.

Regards,
Payment Pulse Collections Team`,
        tone: 'firm',
        channel: 'email',
        triggerDays: [15],
    },
    {
        id: 'urgent_30',
        name: 'Urgent Notice - 30 Days',
        subject: 'URGENT: Immediate Action Required',
        body: `Dear {customerName},

🚨 URGENT NOTICE 🚨

Your payment of ₹{amount} is now {daysOverdue} days overdue.

This is your final reminder before we escalate this matter.

Immediate consequences:
❌ Late fees: ₹{lateFees}
❌ Credit score impact
❌ Legal action may be initiated

💳 PAY NOW: {paymentLink}
📱 UPI: {upiLink}

You have 48 hours to settle this payment.

For payment assistance, call: +91-XXXX-XXXX

Payment Pulse Legal Team`,
        tone: 'urgent',
        channel: 'email',
        triggerDays: [30],
    },
    {
        id: 'legal_60',
        name: 'Legal Notice - 60 Days',
        subject: 'LEGAL NOTICE: Payment Default',
        body: `LEGAL NOTICE

To: {customerName}

This is a formal legal notice regarding your outstanding payment of ₹{amount}, which is now {daysOverdue} days overdue.

Despite multiple reminders, you have failed to settle this amount.

We hereby notify you that:
1. Legal proceedings will be initiated within 7 days
2. Additional legal fees will be added to your outstanding amount
3. This will be reported to credit bureaus
4. Your case will be handed over to our legal team

FINAL OPPORTUNITY TO SETTLE:
💳 {paymentLink}

Contact our legal department immediately: legal@paymentpulse.com

Payment Pulse Legal Department`,
        tone: 'legal',
        channel: 'email',
        triggerDays: [60, 90],
    },
];

/**
 * WhatsApp Message Templates
 */
export const WHATSAPP_TEMPLATES = {
    friendly: `Hi {customerName}! 👋

Just a friendly reminder about your pending payment of ₹{amount}.

{discountMessage}

Pay easily via:
💳 {shortLink}
📱 UPI: {upiLink}

Need help? Reply to this message!`,

    firm: `Hello {customerName},

Your payment of ₹{amount} is {daysOverdue} days overdue.

⚠️ Please pay immediately to avoid late fees.

Quick Pay: {shortLink}
UPI: {upiLink}

{paymentPlanMessage}`,

    urgent: `🚨 URGENT: {customerName}

Payment of ₹{amount} is {daysOverdue} days overdue!

Pay NOW to avoid:
❌ Late fees
❌ Credit score impact
❌ Legal action

PAY: {shortLink}

Last chance!`,
};

/**
 * SMS Templates (160 characters max)
 */
export const SMS_TEMPLATES = {
    friendly: 'Hi {customerName}, your payment of Rs.{amount} is due. Pay now: {shortLink} Save with early payment!',
    firm: 'REMINDER: Rs.{amount} overdue for {daysOverdue} days. Pay immediately: {shortLink} to avoid late fees.',
    urgent: 'URGENT: Rs.{amount} payment overdue! Pay now: {shortLink} or face legal action. Last warning!',
};

/**
 * Determine Reminder Tone Based on Days Overdue
 */
export function getReminderTone(daysOverdue: number): 'friendly' | 'firm' | 'urgent' | 'legal' {
    if (daysOverdue <= 10) return 'friendly';
    if (daysOverdue <= 25) return 'firm';
    if (daysOverdue <= 50) return 'urgent';
    return 'legal';
}

/**
 * Get Appropriate Reminder Template
 */
export function getReminderTemplate(daysOverdue: number, channel: 'email' | 'sms' | 'whatsapp'): string {
    const tone = getReminderTone(daysOverdue);

    if (channel === 'whatsapp') {
        return WHATSAPP_TEMPLATES[tone === 'legal' ? 'urgent' : tone];
    }

    if (channel === 'sms') {
        return SMS_TEMPLATES[tone === 'legal' ? 'urgent' : tone];
    }

    // Email
    const template = REMINDER_TEMPLATES.find(t => t.tone === tone && t.channel === 'email');
    return template?.body || REMINDER_TEMPLATES[0].body;
}

/**
 * Replace Template Variables
 */
export function fillTemplate(template: string, data: any): string {
    let filled = template;

    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        filled = filled.replace(regex, data[key] || '');
    });

    return filled;
}

/**
 * Calculate Late Fees
 */
export function calculateLateFees(amount: number, daysOverdue: number): number {
    // 2% per month, prorated daily
    const dailyRate = 0.02 / 30;
    return amount * dailyRate * daysOverdue;
}

/**
 * Get Customers Needing Reminders Today
 */
export async function getCustomersForReminders(): Promise<Customer[]> {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .gt('days_overdue', 0)
            .order('risk_score', { ascending: false });

        if (error) throw error;

        // Filter customers who need reminders based on days overdue
        const needsReminder = (data || []).filter(customer => {
            const days = customer.days_overdue;
            // Send reminders on days: 7, 15, 30, 45, 60, 90
            return [7, 15, 30, 45, 60, 90].includes(days) ||
                (days > 90 && days % 30 === 0); // Every 30 days after 90
        });

        return needsReminder;
    } catch (error) {
        console.error('Error fetching customers for reminders:', error);
        return [];
    }
}

/**
 * Schedule Reminder for Customer
 */
export async function scheduleReminder(
    customer: Customer,
    channel: 'email' | 'sms' | 'whatsapp',
    paymentLink: string,
    upiLink: string
): Promise<void> {
    try {
        const template = getReminderTemplate(customer.days_overdue, channel);
        const discount = customer.days_overdue <= 7 ? customer.outstanding_amount * 0.05 : 0;
        const lateFees = calculateLateFees(customer.outstanding_amount, customer.days_overdue);

        const templateData = {
            customerName: customer.name,
            amount: customer.outstanding_amount.toLocaleString('en-IN'),
            daysOverdue: customer.days_overdue,
            paymentLink: paymentLink,
            shortLink: paymentLink.replace('https://paymentpulse.app/pay/', 'https://pay.pp/'),
            upiLink: upiLink,
            discountMessage: discount > 0
                ? `💰 Pay today and save ₹${discount.toFixed(2)}!`
                : '',
            paymentPlanMessage: customer.outstanding_amount > 5000
                ? 'Flexible payment plans available. Contact us!'
                : '',
            lateFees: lateFees.toFixed(2),
        };

        const message = fillTemplate(template, templateData);

        // Log the reminder in database
        await supabase.from('reminders').insert({
            customer_id: customer.id,
            channel: channel,
            message: message,
            scheduled_date: new Date().toISOString(),
            status: 'pending',
            days_overdue: customer.days_overdue,
        });

        console.log(`Reminder scheduled for ${customer.name} via ${channel}`);
    } catch (error) {
        console.error('Error scheduling reminder:', error);
    }
}

/**
 * Determine Best Communication Channel
 */
export function getBestChannel(customer: Customer): 'email' | 'sms' | 'whatsapp' {
    // Priority: WhatsApp > SMS > Email
    // In production, this would be based on customer preferences and engagement history

    if (customer.phone) {
        // Prefer WhatsApp for Indian customers (98% open rate)
        return 'whatsapp';
    }

    if (customer.email) {
        return 'email';
    }

    return 'sms';
}

export default {
    REMINDER_TEMPLATES,
    WHATSAPP_TEMPLATES,
    SMS_TEMPLATES,
    getReminderTone,
    getReminderTemplate,
    fillTemplate,
    calculateLateFees,
    getCustomersForReminders,
    scheduleReminder,
    getBestChannel,
};
