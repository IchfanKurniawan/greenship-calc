import React from 'react';
import { useRef } from 'react';
import type { CalculationResult } from '../../engine/types';

interface ResultPanelProps {
  result: CalculationResult;
}

const DAFTAR_URL = 'https://gbcindonesia.org/certification/greenship/form';
const DISCLAIMER = 'Kalkulasi ini merupakan estimasi berdasarkan tabel biaya resmi GBCI. Belum termasuk biaya akomodasi verifikator untuk project di luar Jabodetabek.';

function formatIDR(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <>
      {/* Print-only header */}
      <div className="print-only" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #1B4E4D' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, background: '#1B4E4D', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#D3FEAB', fontWeight: 700, fontSize: 14 }}>GS</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#1B4E4D', margin: 0 }}>GREENSHIP Certification Fee Calculator</p>
            <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>Green Building Council Indonesia — {today}</p>
          </div>
        </div>
      </div>

      <div ref={printRef}>
        {/* Alerts */}
        {(result.warnings.length > 0 || result.edgeCases.length > 0) && (
          <div className="mb-5 flex flex-col gap-2">
            {[...result.warnings, ...result.edgeCases].map((msg, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5" style={{ color: '#D97706' }}>warning</span>
                <p className="text-sm leading-relaxed" style={{ color: '#92400E' }}>{msg}</p>
              </div>
            ))}
          </div>
        )}

        {/* Total — left-aligned, no ring */}
        <div className="mb-7">
          <p className="label-sm text-slate-400 mb-2">Estimasi Total Biaya Sertifikasi</p>
          <p className="text-4xl font-bold text-[#1B4E4D] leading-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatIDR(result.total)}
          </p>
          <p className="text-sm text-slate-400 mt-2">Skema: {result.schemeName}</p>
        </div>

        {/* Breakdown */}
        <div className="result-breakdown rounded-xl overflow-hidden mb-5" style={{ border: '1px solid #F1F5F9' }}>
          <div className="px-4 py-3" style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
            <p className="text-sm font-semibold" style={{ color: '#1B4E4D' }}>Rincian Biaya</p>
          </div>
          {result.breakdown.map((item, i) => {
            if (item.amount === null) return null;
            const isTotal    = item.isTotal;
            const isSubtotal = item.isSubtotal;
            const isWarning  = item.isWarning && !isTotal;

            const rowStyle: React.CSSProperties = isTotal
              ? { background: '#1B4E4D' }
              : isSubtotal
              ? { background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }
              : isWarning
              ? { background: '#FFFBEB', borderTop: '1px solid #F1F5F9' }
              : { borderTop: i === 0 ? 'none' : '1px solid #F8FAFC' };

            return (
              <div key={i} className="px-4 py-3 flex items-start justify-between gap-4" style={rowStyle}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug"
                    style={{ color: isTotal ? 'white' : '#475569', fontWeight: isTotal || isSubtotal ? 600 : 400 }}>
                    {item.label}
                    {item.isCapped && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: '#FEF3C7', color: '#92400E' }}>
                        Cap Diterapkan
                      </span>
                    )}
                  </p>
                  {item.note && (
                    <p className="text-xs mt-0.5" style={{ color: isTotal ? '#D3FEAB' : '#94A3B8' }}>{item.note}</p>
                  )}
                </div>
                <p className="text-sm shrink-0 font-medium whitespace-nowrap"
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    color: isTotal ? '#D3FEAB' : '#1B4E4D',
                    fontWeight: isTotal ? 700 : 500,
                    fontSize: isTotal ? 15 : 13,
                  }}>
                  {formatIDR(item.amount)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-xs leading-relaxed mb-6" style={{ color: '#94A3B8' }}>
          {DISCLAIMER}
        </p>
      </div>

      {/* CTA buttons — hidden on print */}
      <div className="no-print flex flex-col sm:flex-row gap-3 pt-4" style={{ borderTop: '1px solid #F1F5F9' }}>
        <a
          href={DAFTAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{ background: '#1B4E4D', color: '#D3FEAB' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#163f3e')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1B4E4D')}
        >
          <span className="material-symbols-outlined text-lg">how_to_reg</span>
          Daftar Sekarang!
        </a>
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{ border: '2px solid #1B4E4D', color: '#1B4E4D', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(27,78,77,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="material-symbols-outlined text-lg">print</span>
          Print / Unduh PDF
        </button>
      </div>
    </>
  );
};

export default ResultPanel;
