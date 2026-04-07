import { Customer } from '../lib/supabase';

const LOCAL_CUSTOMERS_KEY = 'payment_pulse_local_customers';

type CustomerInsertPayload = {
  user_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  upi_id?: string | null;
  outstanding_amount: number;
  days_overdue: number;
  risk_score: number;
  status: string;
};

function safeParseLocalCustomers(raw: string | null): Customer[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Customer[]) : [];
  } catch {
    return [];
  }
}

function generateLocalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function readLocalCustomers(): Customer[] {
  if (typeof window === 'undefined') return [];
  return safeParseLocalCustomers(window.localStorage.getItem(LOCAL_CUSTOMERS_KEY));
}

export function writeLocalCustomers(customers: Customer[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(customers));
}

export function appendLocalCustomers(customers: CustomerInsertPayload[]): Customer[] {
  const existing = readLocalCustomers();
  const now = new Date().toISOString();

  const mapped = customers.map((customer) => ({
    id: generateLocalId(),
    user_id: customer.user_id ?? 'public-demo',
    name: customer.name,
    email: customer.email ?? null,
    phone: customer.phone ?? null,
    upi_id: customer.upi_id ?? null,
    outstanding_amount: Number(customer.outstanding_amount) || 0,
    days_overdue: Number(customer.days_overdue) || 0,
    risk_score: Number(customer.risk_score) || 0,
    status: customer.status,
    created_at: now,
    updated_at: now,
  })) as Customer[];

  const combined = [...mapped, ...existing];
  writeLocalCustomers(combined);
  return combined;
}

export function mergeCustomers(primary: Customer[], secondary: Customer[]): Customer[] {
  const map = new Map<string, Customer>();

  for (const customer of [...primary, ...secondary]) {
    map.set(customer.id, customer);
  }

  return Array.from(map.values()).sort((a, b) => Number(b.risk_score) - Number(a.risk_score));
}
