import { supabase } from '../lib/supabase';

export interface Payment {
    id: string;
    customer_id: string;
    upi_transaction_id: string;
    upi_id: string;
    amount: number;
    payment_date: string;
    status: string;
    transaction_note?: string;
    created_at: string;
}

export interface PaymentReconciliation {
    payment_id: string;
    customer_id: string;
    matched_amount: number;
    auto_matched: boolean;
    notes?: string;
}

/**
 * Record a new payment from UPI transaction
 */
export async function recordPayment(payment: {
    upi_transaction_id: string;
    upi_id: string;
    amount: number;
    payment_date: string;
    transaction_note?: string;
}): Promise<{ success: boolean; payment?: Payment; error?: string }> {
    try {
        // Find customer by UPI ID
        const { data: customers, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('upi_id', payment.upi_id)
            .limit(1);

        if (customerError) throw customerError;

        if (!customers || customers.length === 0) {
            return {
                success: false,
                error: `No customer found with UPI ID: ${payment.upi_id}`,
            };
        }

        const customer = customers[0];

        // Check if payment already exists (prevent duplicates)
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('*')
            .eq('upi_transaction_id', payment.upi_transaction_id)
            .single();

        if (existingPayment) {
            return {
                success: false,
                error: 'Payment already recorded',
            };
        }

        // Insert payment
        const { data: newPayment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                customer_id: customer.id,
                upi_transaction_id: payment.upi_transaction_id,
                upi_id: payment.upi_id,
                amount: payment.amount,
                payment_date: payment.payment_date,
                status: 'completed',
                transaction_note: payment.transaction_note,
            })
            .select()
            .single();

        if (paymentError) throw paymentError;

        // Record reconciliation
        await supabase.from('payment_reconciliation').insert({
            payment_id: newPayment.id,
            customer_id: customer.id,
            matched_amount: payment.amount,
            auto_matched: true,
            notes: `Auto-matched via UPI ID: ${payment.upi_id}`,
        });

        console.log(`✅ Payment recorded: ₹${payment.amount} from ${customer.name} (${payment.upi_id})`);

        return {
            success: true,
            payment: newPayment,
        };
    } catch (error: any) {
        console.error('Error recording payment:', error);
        return {
            success: false,
            error: error.message || 'Failed to record payment',
        };
    }
}

/**
 * Get all payments for a customer
 */
export async function getCustomerPayments(customerId: string): Promise<Payment[]> {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('customer_id', customerId)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
}

/**
 * Get payment summary for a customer
 */
export async function getPaymentSummary(customerId: string): Promise<{
    totalPaid: number;
    paymentCount: number;
    lastPaymentDate: string | null;
    remainingBalance: number;
}> {
    try {
        const { data: customer } = await supabase
            .from('customers')
            .select('outstanding_amount')
            .eq('id', customerId)
            .single();

        const payments = await getCustomerPayments(customerId);

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const lastPaymentDate = payments.length > 0 ? payments[0].payment_date : null;

        return {
            totalPaid,
            paymentCount: payments.length,
            lastPaymentDate,
            remainingBalance: customer?.outstanding_amount || 0,
        };
    } catch (error) {
        console.error('Error getting payment summary:', error);
        return {
            totalPaid: 0,
            paymentCount: 0,
            lastPaymentDate: null,
            remainingBalance: 0,
        };
    }
}

/**
 * Process bulk UPI payments (e.g., from bank statement import)
 */
export async function processBulkPayments(payments: Array<{
    upi_transaction_id: string;
    upi_id: string;
    amount: number;
    payment_date: string;
    transaction_note?: string;
}>): Promise<{
    processed: number;
    failed: number;
    errors: string[];
}> {
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const payment of payments) {
        const result = await recordPayment(payment);

        if (result.success) {
            processed++;
        } else {
            failed++;
            errors.push(`${payment.upi_id}: ${result.error}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📊 Bulk payment processing complete: ${processed} processed, ${failed} failed`);

    return { processed, failed, errors };
}

/**
 * Get unreconciled payments (payments without customer match)
 */
export async function getUnreconciledPayments(): Promise<any[]> {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .is('customer_id', null)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching unreconciled payments:', error);
        return [];
    }
}

/**
 * Manually reconcile a payment to a customer
 */
export async function manuallyReconcilePayment(
    paymentId: string,
    customerId: string,
    notes?: string
): Promise<boolean> {
    try {
        // Update payment with customer_id
        const { error: paymentError } = await supabase
            .from('payments')
            .update({ customer_id: customerId })
            .eq('id', paymentId);

        if (paymentError) throw paymentError;

        // Get payment details
        const { data: payment } = await supabase
            .from('payments')
            .select('amount')
            .eq('id', paymentId)
            .single();

        // Record reconciliation
        await supabase.from('payment_reconciliation').insert({
            payment_id: paymentId,
            customer_id: customerId,
            matched_amount: payment?.amount || 0,
            auto_matched: false,
            notes: notes || 'Manually reconciled',
        });

        console.log(`✅ Payment manually reconciled to customer`);
        return true;
    } catch (error) {
        console.error('Error reconciling payment:', error);
        return false;
    }
}

/**
 * Get payment statistics
 */
export async function getPaymentStatistics(): Promise<{
    totalPayments: number;
    totalAmount: number;
    todayPayments: number;
    todayAmount: number;
    reconciledCount: number;
    unreconciledCount: number;
}> {
    try {
        const { data: allPayments } = await supabase
            .from('payments')
            .select('amount, payment_date, customer_id');

        const today = new Date().toISOString().split('T')[0];
        const todayPayments = (allPayments || []).filter(p =>
            p.payment_date.startsWith(today)
        );

        const reconciled = (allPayments || []).filter(p => p.customer_id !== null);
        const unreconciled = (allPayments || []).filter(p => p.customer_id === null);

        return {
            totalPayments: allPayments?.length || 0,
            totalAmount: (allPayments || []).reduce((sum, p) => sum + p.amount, 0),
            todayPayments: todayPayments.length,
            todayAmount: todayPayments.reduce((sum, p) => sum + p.amount, 0),
            reconciledCount: reconciled.length,
            unreconciledCount: unreconciled.length,
        };
    } catch (error) {
        console.error('Error getting payment statistics:', error);
        return {
            totalPayments: 0,
            totalAmount: 0,
            todayPayments: 0,
            todayAmount: 0,
            reconciledCount: 0,
            unreconciledCount: 0,
        };
    }
}

export default {
    recordPayment,
    getCustomerPayments,
    getPaymentSummary,
    processBulkPayments,
    getUnreconciledPayments,
    manuallyReconcilePayment,
    getPaymentStatistics,
};
