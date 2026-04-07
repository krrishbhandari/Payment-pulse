import { Customer } from '../lib/supabase';
import { generatePaymentLink, generatePaymentPlanOptions } from './paymentService';
import {
    getCustomersForReminders,
    scheduleReminder,
    getReminderTemplate,
    fillTemplate,
    calculateLateFees
} from './reminderService';
import { sendNotification } from './communicationService';

export interface FollowUpResult {
    totalCustomers: number;
    remindersSent: number;
    remindersFailed: number;
    channels: {
        email: number;
    };
}

/**
 * Main Automated Follow-up Orchestrator
 * This runs daily to send automated reminders
 */
export async function runAutomatedFollowUp(): Promise<FollowUpResult> {
    console.log('🤖 Starting Automated Follow-up System...');

    const result: FollowUpResult = {
        totalCustomers: 0,
        remindersSent: 0,
        remindersFailed: 0,
        channels: {
            email: 0,
        },
    };

    try {
        // Get customers who need reminders today
        const customers = await getCustomersForReminders();
        result.totalCustomers = customers.length;

        console.log(`📊 Found ${customers.length} customers needing reminders`);

        // Process each customer
        for (const customer of customers) {
            await processCustomerReminder(customer, result);
        }

        return result;
    } catch (error) {
        console.error('❌ Error in automated follow-up:', error);
        throw error;
    }
}

/**
 * Process Single Customer Reminder
 */
async function processCustomerReminder(customer: Customer, result: FollowUpResult) {
    try {
        // Always default to email now
        if (!customer.email) {
            console.log(`⚠️ Skipping ${customer.name} - No email available`);
            return;
        }

        // 1. Generate Payment Link
        const paymentLinkData = await generatePaymentLink({
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email || undefined,
            customerPhone: customer.phone || undefined,
            amount: customer.outstanding_amount,
            description: `Payment for outstanding invoice - ${customer.days_overdue} days overdue`,
            daysOverdue: customer.days_overdue
        });

        // 2. Calculate Late Fees
        const lateFees = calculateLateFees(customer.outstanding_amount, customer.days_overdue);

        // 3. Generate Payment Plans (for high dues)
        const paymentPlans = generatePaymentPlanOptions(customer.outstanding_amount, customer.days_overdue);

        // 4. Get Message Template (Force 'email' channel)
        const template = getReminderTemplate(customer.days_overdue, 'email');

        // 5. Calculate Discount (Dynamic Discounting)
        const discount = customer.days_overdue > 60 ? 0 :
            customer.days_overdue < 30 ? customer.outstanding_amount * 0.05 : 0;

        const paymentPlanMessage = paymentPlans.length > 1
            ? `Flexible payment plans available:\n${paymentPlans.map(p => `• ${p.description}`).join('\n')}`
            : '';

        // Fill template with customer data
        const templateData = {
            customerName: customer.name,
            amount: customer.outstanding_amount.toLocaleString('en-IN'),
            daysOverdue: customer.days_overdue,
            paymentLink: paymentLinkData.paymentLink,
            shortLink: paymentLinkData.shortUrl,
            upiLink: paymentLinkData.upiLink,
            discountMessage: discount > 0
                ? `💰 Pay today and save ₹${discount.toFixed(2)}! Limited time offer.`
                : '',
            paymentPlanMessage: paymentPlanMessage,
            lateFees: lateFees.toFixed(2),
        };

        const message = fillTemplate(template, templateData);

        // Send notification
        const recipient = {
            email: customer.email || undefined,
        };

        const success = await sendNotification('email', recipient, {
            subject: getSubjectLine(customer.days_overdue),
            body: message,
        });

        if (success) {
            result.remindersSent++;
            result.channels['email']++;
            console.log(`✅ Reminder sent via email`);

            // Schedule the reminder in database
            await scheduleReminder(customer, 'email', paymentLinkData.paymentLink, paymentLinkData.upiLink);
        } else {
            result.remindersFailed++;
            console.log(`❌ Failed to send reminder via email`);
        }
    } catch (error) {
        console.error(`Error processing reminder for ${customer.name}:`, error);
        result.remindersFailed++;
    }
}

/**
 * Send Immediate Reminder (Manual Trigger)
 */
export async function sendImmediateReminder(customer: Customer, channel: 'email'): Promise<boolean> {
    const result: FollowUpResult = {
        totalCustomers: 1,
        remindersSent: 0,
        remindersFailed: 0,
        channels: { email: 0 },
    };

    if (channel !== 'email') {
        console.error('Only email channel is supported');
        return false;
    }

    await processCustomerReminder(customer, result);

    return result.remindersSent > 0;
}

/**
 * Get Email Subject Line Based on Days Overdue
 */
function getSubjectLine(daysOverdue: number): string {
    if (daysOverdue <= 10) {
        return 'Friendly Payment Reminder';
    } else if (daysOverdue <= 30) {
        return 'Payment Reminder: Invoice Overdue';
    } else if (daysOverdue <= 60) {
        return 'Urgent: Payment Overdue - Action Required';
    } else {
        return 'IMMEDIATE ACTION REQUIRED: Account Delinquent';
    }
}
