import { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle, Sparkles, FileSpreadsheet, FileJson } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateAdvancedRiskScore, getRiskCategory } from '../utils/riskScoreCalculator';
import { parseFile, getFileTypeDescription } from '../utils/fileParser';
import { appendLocalCustomers } from '../utils/localCustomerStore';

// Royal Color Palette - High Contrast
const COLORS = {
  primary: '#1b4079',    // Deep Blue
  secondary: '#4d7c8a',  // Steel Blue
  accent1: '#7f9c96',    // Sage Green
  accent2: '#8fad88',    // Olive Green
  gold: '#b8860b',       // Dark Gold
  lightGold: '#f4e4a6',
  dark: '#0a1931',       // Slate 900
  light: '#f8f9fa',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  white: '#ffffff',
  textHeader: '#0f172a',
  textBody: '#334155',
};

interface FileUploadProps {
  onUploadComplete: () => void;
  isDarkMode?: boolean;
}

export default function FileUpload({ onUploadComplete, isDarkMode = false }: FileUploadProps) {
  const demoUserId = 'public-demo';
  // CSV State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CSV Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      const validExtensions = ['.csv', '.xlsx', '.xls', '.json'];
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));

      if (isValid) {
        setFile(selectedFile);
        setError('');
        setSuccess('');
      } else {
        setError('Please upload a CSV, Excel (XLSX/XLS), or JSON file');
        setFile(null);
      }
    }
  };

  const calculateRiskScore = (amount: number, daysOverdue: number): number => {
    // Use the advanced risk score calculator from backend
    const riskScore = calculateAdvancedRiskScore({
      daysOverdue,
      outstandingAmount: amount,
      isFirstDefault: true, // CSV upload = first we're seeing this customer
    });
    return riskScore;
  };

  const isConnectivityError = (error: any): boolean => {
    const message = (error?.message || '').toLowerCase();
    const details = (error?.details || '').toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('name_not_resolved') ||
      details.includes('failed to fetch')
    );
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Use the universal file parser
      const parsedTransactions = await parseFile(file);

      if (parsedTransactions.length === 0) {
        throw new Error('No valid data found in file');
      }

      // Process each transaction and calculate risk scores
      const customers = parsedTransactions.map((transaction, index) => {
        const riskScore = calculateRiskScore(
          transaction.outstanding_amount || 0,
          transaction.days_overdue || 0
        );

        return {
          user_id: demoUserId,
          name: transaction.name || `Customer ${index + 1}`,
          email: transaction.email || null,
          phone: transaction.phone || null,
          upi_id: transaction.upi_id || null,
          outstanding_amount: transaction.outstanding_amount || 0,
          days_overdue: transaction.days_overdue || 0,
          risk_score: riskScore,
          status: getRiskCategory(riskScore).category,
        };
      });

      let savedInLocalMode = false;

      try {
        // Insert customers into database
        const { error: insertError } = await supabase.from('customers').insert(customers);
        if (insertError) throw insertError;

        // Log the uploaded file
        const { error: fileError } = await supabase.from('uploaded_files').insert({
          user_id: demoUserId,
          file_name: file.name,
          file_type: file.type || getFileTypeDescription(file),
          processing_status: 'completed',
          records_processed: customers.length,
        });
        if (fileError) throw fileError;
      } catch (dbError: any) {
        if (!isConnectivityError(dbError)) {
          throw dbError;
        }

        appendLocalCustomers(customers);
        savedInLocalMode = true;
      }

      const fileType = getFileTypeDescription(file);
      if (savedInLocalMode) {
        setSuccess(`Processed ${customers.length} records from ${fileType}. Supabase is unreachable, so data was saved in local demo mode.`);
      } else {
        setSuccess(`Successfully processed ${customers.length} records from ${fileType}.`);
      }
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS.gold }} />
          <h2 className="text-2xl font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.textHeader }}>
            Import Data
          </h2>
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS.gold }} />
        </div>
        <p style={{ color: isDarkMode ? '#b8c5d0' : COLORS.textBody }}>
          Convert payment data automatically
        </p>
      </div>

      {/* --- CSV Upload Section --- */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div
          className="border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 hover:shadow-lg cursor-pointer bg-white"
          style={{
            borderColor: file ? COLORS.primary : `${COLORS.primary}30`,
            backgroundColor: file ? `${COLORS.primary}05` : `${COLORS.white}`,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                boxShadow: `0 8px 32px ${COLORS.primary}30`,
              }}
            >
              {file ? <CheckCircle className="w-10 h-10 text-white" /> : <Upload className="w-10 h-10 text-white" />}
            </div>
            <p className="text-lg mb-2 font-semibold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.textHeader }}>
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.textBody }}>
              CSV, Excel (XLSX/XLS), or JSON files (Max 10MB)
            </p>
          </label>
        </div>

        {/* File Info */}
        {file && (
          <div
            className="flex items-center justify-between rounded-xl p-4 border transition-all duration-300 hover:shadow-md bg-white"
            style={{
              borderColor: `${COLORS.primary}30`,
            }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${COLORS.primary}10` }}
              >
                <FileText className="w-5 h-5" style={{ color: COLORS.primary }} />
              </div>
              <div>
                <p className="font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.textHeader }}>{file.name}</p>
                <p className="text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.textBody }}>
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              style={{ color: COLORS.textBody }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Manual Upload Button */}
        <button
          onClick={handleFileUpload}
          disabled={!file || uploading}
          className="w-full py-4 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-white"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            boxShadow: `0 8px 32px ${COLORS.primary}40`,
          }}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing {file ? getFileTypeDescription(file) : 'File'}...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload and Process</span>
            </>
          )}
        </button>

        {/* Guidelines */}
        <div
          className="rounded-2xl p-6 border transition-all duration-300 hover:shadow-md bg-white"
          style={{
            borderColor: `${COLORS.primary}20`,
          }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: COLORS.gold }} />
            <h3 className="font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.textHeader }}>Supported File Formats:</h3>
          </div>
          <ul className="text-sm space-y-2 font-medium" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.textBody }}>
            <li className="flex items-center space-x-2">
              <FileText className="w-4 h-4" style={{ color: COLORS.primary }} />
              <span><strong>CSV:</strong> Standard comma-separated values with headers</span>
            </li>
            <li className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4" style={{ color: COLORS.accent2 }} />
              <span><strong>Excel (XLSX/XLS):</strong> GPay transaction exports, bank statements</span>
            </li>
            <li className="flex items-center space-x-2">
              <FileJson className="w-4 h-4" style={{ color: COLORS.secondary }} />
              <span><strong>JSON:</strong> Digital payment platform exports</span>
            </li>
            <li className="mt-3 pt-3 border-t" style={{ borderColor: `${COLORS.primary}20` }}>
              • Required: Name, Amount, Days Overdue
            </li>
            <li>• Recommended: UPI ID (for automatic payment tracking)</li>
            <li>• Optional: Email, Phone, Transaction Date</li>
            <li>• Amount should be numeric in INR</li>
            <li>• The system will automatically detect and map your file columns</li>
          </ul>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div
          className="flex items-center space-x-2 rounded-xl p-4 border bg-red-50"
          style={{
            borderColor: `${COLORS.danger}40`,
            color: COLORS.danger,
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="flex items-center space-x-2 rounded-xl p-4 border bg-emerald-50"
          style={{
            borderColor: `${COLORS.success}40`,
            color: COLORS.success,
          }}
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}
    </div>
  );
}