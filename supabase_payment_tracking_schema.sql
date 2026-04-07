-- Add UPI ID column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- Remove auth dependency so the app can run as a public demo.
ALTER TABLE customers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_user_id_fkey;

DO $$
BEGIN
  IF to_regclass('public.customers') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS customers_public_read ON public.customers';
    EXECUTE 'CREATE POLICY customers_public_read ON public.customers FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS customers_public_write ON public.customers';
    EXECUTE 'CREATE POLICY customers_public_write ON public.customers FOR INSERT WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS customers_public_update ON public.customers';
    EXECUTE 'CREATE POLICY customers_public_update ON public.customers FOR UPDATE USING (true) WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS customers_public_delete ON public.customers';
    EXECUTE 'CREATE POLICY customers_public_delete ON public.customers FOR DELETE USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.transactions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS transactions_public_read ON public.transactions';
    EXECUTE 'CREATE POLICY transactions_public_read ON public.transactions FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS transactions_public_write ON public.transactions';
    EXECUTE 'CREATE POLICY transactions_public_write ON public.transactions FOR INSERT WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS transactions_public_update ON public.transactions';
    EXECUTE 'CREATE POLICY transactions_public_update ON public.transactions FOR UPDATE USING (true) WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS transactions_public_delete ON public.transactions';
    EXECUTE 'CREATE POLICY transactions_public_delete ON public.transactions FOR DELETE USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.uploaded_files') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.uploaded_files ALTER COLUMN user_id DROP NOT NULL';
    EXECUTE 'DROP POLICY IF EXISTS uploaded_files_public_read ON public.uploaded_files';
    EXECUTE 'CREATE POLICY uploaded_files_public_read ON public.uploaded_files FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS uploaded_files_public_write ON public.uploaded_files';
    EXECUTE 'CREATE POLICY uploaded_files_public_write ON public.uploaded_files FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.analysis_results') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.analysis_results ALTER COLUMN user_id DROP NOT NULL';
    EXECUTE 'DROP POLICY IF EXISTS analysis_results_public_read ON public.analysis_results';
    EXECUTE 'CREATE POLICY analysis_results_public_read ON public.analysis_results FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS analysis_results_public_write ON public.analysis_results';
    EXECUTE 'CREATE POLICY analysis_results_public_write ON public.analysis_results FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.payments') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS payments_public_read ON public.payments';
    EXECUTE 'CREATE POLICY payments_public_read ON public.payments FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS payments_public_write ON public.payments';
    EXECUTE 'CREATE POLICY payments_public_write ON public.payments FOR INSERT WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS payments_public_update ON public.payments';
    EXECUTE 'CREATE POLICY payments_public_update ON public.payments FOR UPDATE USING (true) WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS payments_public_delete ON public.payments';
    EXECUTE 'CREATE POLICY payments_public_delete ON public.payments FOR DELETE USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.payment_reconciliation') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.payment_reconciliation ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS payment_reconciliation_public_read ON public.payment_reconciliation';
    EXECUTE 'CREATE POLICY payment_reconciliation_public_read ON public.payment_reconciliation FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS payment_reconciliation_public_write ON public.payment_reconciliation';
    EXECUTE 'CREATE POLICY payment_reconciliation_public_write ON public.payment_reconciliation FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Create payments table to track all incoming payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  upi_transaction_id TEXT UNIQUE NOT NULL,
  upi_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'completed',
  transaction_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_upi_id ON payments(upi_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);

-- Create payment_reconciliation table to track auto-reconciliation
CREATE TABLE IF NOT EXISTS payment_reconciliation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  matched_amount DECIMAL(10, 2) NOT NULL,
  reconciliation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auto_matched BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Create trigger to update customer outstanding amount when payment is added
CREATE OR REPLACE FUNCTION update_customer_outstanding()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET 
    outstanding_amount = GREATEST(0, outstanding_amount - NEW.amount),
    updated_at = NOW()
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_outstanding
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION update_customer_outstanding();

-- Create view for customer payment summary
CREATE OR REPLACE VIEW customer_payment_summary AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  c.upi_id,
  c.outstanding_amount as current_outstanding,
  c.days_overdue,
  COALESCE(SUM(p.amount), 0) as total_paid,
  COUNT(p.id) as payment_count,
  MAX(p.payment_date) as last_payment_date
FROM customers c
LEFT JOIN payments p ON c.id = p.customer_id
GROUP BY c.id, c.name, c.email, c.phone, c.upi_id, c.outstanding_amount, c.days_overdue;
