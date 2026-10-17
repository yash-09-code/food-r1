import React from 'react';
import { FileSpreadsheet, Download, ShieldCheck, DollarSign } from 'lucide-react';
import { adminService } from '../services/restaurantService';

export const AdminReports: React.FC = () => {
  const csvUrl = adminService.getSalesCsvUrl();

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
          Auditing & Business Analytics
        </span>
        <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
          Sales Reports & CSV Export
        </h2>
        <p className="text-xs text-[#77786F] mt-1">
          Export full ledger accounting data including Cashfree verification statuses, item breakdown, and table mappings.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-[#173D2D]">
              Complete Historical Sales Ledger
            </h3>
            <p className="text-xs text-[#77786F] leading-relaxed">
              Generates an RFC-4180 compliant CSV file containing Order References, Timestamps, Patron Names, Phone Numbers, Order Types, Tables, Subtotals, Discounts, Taxes, and Payment Verification statuses.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-between">
          <div className="text-xs text-[#77786F] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Server-Side Data Generation</span>
          </div>

          <a
            href={csvUrl}
            download="saffron_sage_sales_report.csv"
            className="px-6 py-3 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#123023] transition-all shadow flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#C6A15B]" />
            <span>Download CSV Report</span>
          </a>
        </div>
      </div>
    </div>
  );
};
