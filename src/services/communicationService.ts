// Email configuration (using SendGrid or similar)
interface EmailOptions {
    to: string;
    subject: string;
    body: string;
    html?: string;
}

/**
 * Send Email - Opens Gmail Web Composer
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        console.log('📧 Opening Gmail...');

        // Create Gmail Web Link (Bypasses OS settings to fix WhatsApp redirection issue)
        const subject = encodeURIComponent(options.subject);
        const body = encodeURIComponent(options.body);

        // Use Gmail's specific compose URL
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${options.to}&su=${subject}&body=${body}`;

        // Open in new tab
        window.open(gmailLink, '_blank');

        return true;
    } catch (error) {
        console.error('Error opening email client:', error);
        return false;
    }
}

/**
 * Send Multi-Channel Notification
 * (Now restricted to Email only)
 */
export async function sendNotification(
    channel: 'email',
    recipient: { email?: string },
    message: { subject?: string; body: string }
): Promise<boolean> {
    try {
        if (channel === 'email') {
            if (!recipient.email) {
                console.warn('No email address provided');
                return false;
            }
            return await sendEmail({
                to: recipient.email,
                subject: message.subject || 'Payment Reminder',
                body: message.body,
            });
        }

        console.error('Invalid channel:', channel);
        return false;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

/**
 * Send Bulk Reminders
 */
export async function sendBulkReminders(
    reminders: Array<{
        channel: 'email';
        recipient: { email?: string };
        message: { subject?: string; body: string };
    }>
): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const reminder of reminders) {
        const success = await sendNotification(
            reminder.channel,
            reminder.recipient,
            reminder.message
        );

        if (success) {
            sent++;
        } else {
            failed++;
        }

        // Rate limiting: wait 100ms between messages
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed };
}

/**
 * Validate Email Address
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export default {
    sendEmail,
    sendNotification,
    sendBulkReminders,
    isValidEmail,
};
