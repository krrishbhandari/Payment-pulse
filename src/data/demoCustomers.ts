import { Customer } from '../lib/supabase';

export type DemoCustomerSeed = {
  name: string;
  email: string | null;
  phone: string | null;
  upi_id: string | null;
  outstanding_amount: number;
  days_overdue: number;
  risk_score: number;
  status: string;
  cibil_score: number;
  salary: number;
  job_profile: string;
  gender: string;
};

const DEMO_USER_ID = 'public-demo';

const demoCustomerSeeds: DemoCustomerSeed[] = [
  {
    name: 'Apex Retail Pvt Ltd',
    email: 'accounts@apexretail.example',
    phone: '+91 98765 12001',
    upi_id: 'apexretail@paytm',
    outstanding_amount: 185000,
    days_overdue: 96,
    risk_score: 92,
    status: 'high_risk',
    cibil_score: 612,
    salary: 780000,
    job_profile: 'Finance Manager',
    gender: 'Female',
  },
  {
    name: 'Bluepeak Distributors',
    email: 'billing@bluepeak.example',
    phone: '+91 98765 12002',
    upi_id: 'bluepeak@upi',
    outstanding_amount: 98000,
    days_overdue: 67,
    risk_score: 78,
    status: 'high_risk',
    cibil_score: 648,
    salary: 620000,
    job_profile: 'Operations Head',
    gender: 'Male',
  },
  {
    name: 'Crestline Foods',
    email: 'finance@crestline.example',
    phone: '+91 98765 12003',
    upi_id: 'crestline@oksbi',
    outstanding_amount: 54000,
    days_overdue: 41,
    risk_score: 63,
    status: 'moderate_risk',
    cibil_score: 701,
    salary: 540000,
    job_profile: 'Accounts Executive',
    gender: 'Female',
  },
  {
    name: 'Dhanvi Engineering Works',
    email: 'payables@dhanvi.example',
    phone: '+91 98765 12004',
    upi_id: 'dhanvi@paytm',
    outstanding_amount: 27000,
    days_overdue: 28,
    risk_score: 42,
    status: 'moderate_risk',
    cibil_score: 732,
    salary: 680000,
    job_profile: 'Procurement Lead',
    gender: 'Male',
  },
  {
    name: 'Evergreen Logistics',
    email: 'finance@evergreen.example',
    phone: '+91 98765 12005',
    upi_id: 'evergreen@upi',
    outstanding_amount: 12500,
    days_overdue: 14,
    risk_score: 29,
    status: 'low_risk',
    cibil_score: 768,
    salary: 590000,
    job_profile: 'Billing Coordinator',
    gender: 'Female',
  },
  {
    name: 'Fusion Healthcare',
    email: 'accounts@fusionhealth.example',
    phone: '+91 98765 12006',
    upi_id: 'fusionhealth@ybl',
    outstanding_amount: 7600,
    days_overdue: 9,
    risk_score: 24,
    status: 'low_risk',
    cibil_score: 790,
    salary: 840000,
    job_profile: 'Accounts Manager',
    gender: 'Male',
  },
  {
    name: 'Greenfield Supplies',
    email: 'billing@greenfield.example',
    phone: '+91 98765 12007',
    upi_id: 'greenfield@oksbi',
    outstanding_amount: 3400,
    days_overdue: 4,
    risk_score: 14,
    status: 'low_risk',
    cibil_score: 812,
    salary: 510000,
    job_profile: 'Collections Associate',
    gender: 'Female',
  },
  {
    name: 'Harbor Tech Services',
    email: 'finance@harbortech.example',
    phone: '+91 98765 12008',
    upi_id: 'harbortech@paytm',
    outstanding_amount: 0,
    days_overdue: 0,
    risk_score: 7,
    status: 'resolved',
    cibil_score: 826,
    salary: 910000,
    job_profile: 'Revenue Analyst',
    gender: 'Male',
  },
];

function buildTimestamp(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export function getDemoCustomerSeeds(): DemoCustomerSeed[] {
  return demoCustomerSeeds;
}

export function getDemoCustomerInsertPayload() {
  return demoCustomerSeeds.map((seed, index) => ({
    user_id: DEMO_USER_ID,
    name: seed.name,
    email: seed.email,
    phone: seed.phone,
    upi_id: seed.upi_id,
    outstanding_amount: seed.outstanding_amount,
    days_overdue: seed.days_overdue,
    risk_score: seed.risk_score,
    status: seed.status,
    cibil_score: seed.cibil_score,
    salary: seed.salary,
    job_profile: seed.job_profile,
    gender: seed.gender,
    created_at: buildTimestamp(21 - index * 2),
    updated_at: buildTimestamp(6 - index),
  }));
}

export function createDemoCustomers(): Customer[] {
  return demoCustomerSeeds.map((seed, index) => ({
    id: `demo-customer-${index + 1}`,
    user_id: DEMO_USER_ID,
    name: seed.name,
    email: seed.email,
    phone: seed.phone,
    upi_id: seed.upi_id,
    outstanding_amount: seed.outstanding_amount,
    days_overdue: seed.days_overdue,
    risk_score: seed.risk_score,
    status: seed.status,
    cibil_score: seed.cibil_score,
    salary: seed.salary,
    job_profile: seed.job_profile,
    gender: seed.gender,
    created_at: buildTimestamp(21 - index * 2),
    updated_at: buildTimestamp(6 - index),
  }));
}