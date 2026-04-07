import * as XLSX from 'xlsx';

export interface ParsedTransaction {
    name: string;
    email?: string;
    phone?: string;
    upi_id?: string;  // Customer's UPI ID for payment tracking
    outstanding_amount: number;
    days_overdue: number;
    transaction_date?: string;
    description?: string;
    cibil_score?: number;
    salary?: number;
    job_profile?: string;
    gender?: string;
}

/**
 * Parse CSV file
 */
export async function parseCSV(file: File): Promise<ParsedTransaction[]> {
    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

    const transactions: ParsedTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;

        const transaction: any = {};

        headers.forEach((header, index) => {
            const value = values[index]?.trim();
            if (header.includes('name')) transaction.name = value || 'Unknown';
            if (header.includes('email')) transaction.email = value || null;
            if (header.includes('phone')) transaction.phone = value || null;
            if (header.includes('upi') && header.includes('id')) transaction.upi_id = value || null;
            if (header.includes('amount') || header.includes('outstanding'))
                transaction.outstanding_amount = parseFloat(value) || 0;
            if (header.includes('overdue') || header.includes('days'))
                transaction.days_overdue = parseInt(value) || 0;
            if (header.includes('date')) transaction.transaction_date = value;
            if (header.includes('description') || header.includes('desc'))
                transaction.description = value;
            if (header.includes('cibil')) transaction.cibil_score = parseInt(value) || 0;
            if (header.includes('salary') || header.includes('income')) transaction.salary = parseFloat(value) || 0;
            if (header.includes('job') || header.includes('profile') || header.includes('designation')) transaction.job_profile = value;
            if (header.includes('gender') || header.includes('sex')) transaction.gender = value;
        });

        if (!transaction.name) transaction.name = `Customer ${i}`;
        transactions.push(transaction);
    }

    return transactions;
}

/**
 * Parse Excel/XLSX file (GPay, Bank Statements)
 */
export async function parseExcel(file: File): Promise<ParsedTransaction[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                const transactions: ParsedTransaction[] = jsonData.map((row, index) => {
                    // Try to intelligently map columns
                    const name = row['Name'] || row['Customer Name'] || row['Party'] || row['Counterparty'] || `Customer ${index + 1}`;
                    const email = row['Email'] || row['Email Address'] || null;
                    const phone = row['Phone'] || row['Mobile'] || row['Contact'] || null;
                    const upiId = row['UPI ID'] || row['UPI'] || row['VPA'] || row['upi_id'] || null;

                    // Amount parsing - handle various formats
                    let amount = 0;
                    if (row['Amount'] !== undefined) amount = parseFloat(String(row['Amount']).replace(/[₹,]/g, ''));
                    else if (row['Outstanding'] !== undefined) amount = parseFloat(String(row['Outstanding']).replace(/[₹,]/g, ''));
                    else if (row['Debit'] !== undefined) amount = parseFloat(String(row['Debit']).replace(/[₹,]/g, ''));
                    else if (row['Credit'] !== undefined) amount = Math.abs(parseFloat(String(row['Credit']).replace(/[₹,]/g, '')));

                    // Days overdue
                    const daysOverdue = row['Days Overdue'] || row['Overdue Days'] || 0;

                    // Transaction date
                    const transactionDate = row['Date'] || row['Transaction Date'] || row['Txn Date'] || null;

                    // Description
                    const description = row['Description'] || row['Narration'] || row['Remarks'] || null;

                    // New Attributes
                    const cibil = row['CIBIL'] || row['Cibil Score'] || row['Score'] || 0;
                    const salary = row['Salary'] || row['Income'] || row['CTC'] || 0;
                    const job = row['Job Profile'] || row['Designation'] || row['Role'] || row['Job'] || null;
                    const gender = row['Gender'] || row['Sex'] || null;

                    return {
                        name,
                        email,
                        phone,
                        upi_id: upiId,
                        outstanding_amount: amount,
                        days_overdue: parseInt(String(daysOverdue)) || 0,
                        transaction_date: transactionDate,
                        description,
                        cibil_score: parseInt(String(cibil)) || undefined,
                        salary: parseFloat(String(salary)) || undefined,
                        job_profile: job,
                        gender: gender,
                    };
                });

                resolve(transactions);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read Excel file'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Parse JSON file (Digital payment exports)
 */
export async function parseJSON(file: File): Promise<ParsedTransaction[]> {
    const text = await file.text();
    const data = JSON.parse(text);

    // Handle array of transactions
    if (Array.isArray(data)) {
        return data.map((item, index) => ({
            name: item.name || item.customer || item.party || `Customer ${index + 1}`,
            email: item.email || null,
            phone: item.phone || item.mobile || null,
            upi_id: item.upi_id || item.upi || item.vpa || null,
            outstanding_amount: parseFloat(item.amount || item.outstanding || 0),
            days_overdue: parseInt(item.days_overdue || item.overdue || 0),
            transaction_date: item.date || item.transaction_date || null,
            description: item.description || item.narration || null,
            cibil_score: parseInt(item.cibil_score || item.cibil || 0) || undefined,
            salary: parseFloat(item.salary || item.income || 0) || undefined,
            job_profile: item.job_profile || item.job || item.designation || null,
            gender: item.gender || item.sex || null,
        }));
    }

    // Handle single transaction object
    if (typeof data === 'object' && data !== null) {
        return [{
            name: data.name || data.customer || 'Unknown',
            email: data.email || null,
            phone: data.phone || data.mobile || null,
            upi_id: data.upi_id || data.upi || data.vpa || null,
            outstanding_amount: parseFloat(data.amount || data.outstanding || 0),
            days_overdue: parseInt(data.days_overdue || data.overdue || 0),
            transaction_date: data.date || data.transaction_date || null,
            description: data.description || data.narration || null,
            cibil_score: parseInt(data.cibil_score || data.cibil || 0) || undefined,
            salary: parseFloat(data.salary || data.income || 0) || undefined,
            job_profile: data.job_profile || data.job || data.designation || null,
            gender: data.gender || data.sex || null,
        }];
    }

    throw new Error('Invalid JSON format');
}

/**
 * Main parser function - detects file type and routes to appropriate parser
 */
export async function parseFile(file: File): Promise<ParsedTransaction[]> {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // CSV
    if (fileName.endsWith('.csv') || fileType === 'text/csv') {
        return parseCSV(file);
    }

    // Excel
    if (
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls') ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel'
    ) {
        return parseExcel(file);
    }

    // JSON
    if (fileName.endsWith('.json') || fileType === 'application/json') {
        return parseJSON(file);
    }

    throw new Error('Unsupported file format. Please upload CSV, Excel (XLSX/XLS), or JSON files.');
}

/**
 * Get supported file extensions
 */
export function getSupportedFileTypes(): string {
    return '.csv,.xlsx,.xls,.json';
}

/**
 * Get file type description
 */
export function getFileTypeDescription(file: File): string {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) return 'CSV File';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'Excel Spreadsheet';
    if (fileName.endsWith('.json')) return 'JSON Data';

    return 'Unknown Format';
}
