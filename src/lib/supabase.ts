import { createClient, } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Customer {
  id: string;
  user_id?: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  upi_id?: string | null;
  outstanding_amount: number;
  days_overdue: number;
  risk_score: number;
  status: string;
  created_at: string;
  updated_at: string;
  cibil_score?: number;
  salary?: number;
  job_profile?: string;
  gender?: string;
}
