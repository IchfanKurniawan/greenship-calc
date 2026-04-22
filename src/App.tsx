import { useState, useCallback } from 'react';
import SideNav from './components/layout/SideNav';
import Footer from './components/layout/Footer';
import NBEBForm from './components/forms/NBEBForm';
import { ISForm, TSForm, HomesAForm, HomesBForm, NHForm } from './components/forms/OtherForms';
import ResultPanel from './components/results/ResultPanel';
import type { Scheme, CalculationResult } from './engine/types';

const SCHEME_META: Record<Scheme, { title: string; desc: string; icon: string }> = {
  NB:      { title: 'New Building',        desc: 'Bangunan baru, rating pertama kali',          icon: 'apartment' },
  EB:      { title: 'Existing Building',   desc: 'Bangunan eksisting yang sudah beroperasi',     icon: 'domain' },
  IS:      { title: 'Interior Space',      desc: 'Ruang interior dalam bangunan',               icon: 'meeting_room' },
  TS:      { title: 'Transit Station',     desc: 'Stasiun transportasi publik',                 icon: 'train' },
  HOMES_A: { title: 'Homes — Individual',  desc: 'Rumah tunggal (Track A)',                     icon: 'home' },
  HOMES_B: { title: 'Homes — Developer',   desc: 'Kluster perumahan / developer (Track B)',     icon: 'holiday_village' },
  NH_PLAN: { title: 'Neighborhood',        desc: 'Kawasan permukiman (Plan & Built)',            icon: 'map' },
  NH_BUILT:{ title: 'Neighborhood',        desc: 'Kawasan permukiman (Plan & Built)',            icon: 'map' },
};

const WELCOME_SCHEMES: { scheme: Scheme; label: string; icon: string; code: string }[] = [
  { scheme: 'NB',      label: 'New Building',      code: 'NB',      icon: 'apartment' },
  { scheme: 'EB',      label: 'Existing Building', code: 'EB',      icon: 'domain' },
  { scheme: 'IS',      label: 'Interior Space',    code: 'IS',      icon: 'meeting_room' },
  { scheme: 'TS',      label: 'Transit Station',   code: 'TS',      icon: 'train' },
  { scheme: 'HOMES_A', label: 'Homes Individual',  code: 'Homes A', icon: 'home' },
  { scheme: 'HOMES_B', label: 'Homes Developer',   code: 'Homes B', icon: 'holiday_village' },
  { scheme: 'NH_PLAN', label: 'Neighborhood',      code: 'NH',      icon: 'map' },
];

export default function App() {
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const handleSchemeSelect = useCallback((scheme: Scheme) => {
    setSelectedScheme(scheme);
    setResult(null);
  }, []);

  const handleNew = useCallback(() => {
    setSelectedScheme(null);
    setResult(null);
  }, []);

  const renderForm = () => {
    if (!selectedScheme) return null;
    const props = { onResult: setResult };
    switch (selectedScheme) {
      case 'NB':      return <NBEBForm key="NB" scheme="NB" onResult={setResult} />;
      case 'EB':      return <NBEBForm key="EB" scheme="EB" onResult={setResult} />;
      case 'IS':      return <ISForm {...props} />;
      case 'TS':      return <TSForm {...props} />;
      case 'HOMES_A': return <HomesAForm {...props} />;
      case 'HOMES_B': return <HomesBForm {...props} />;
      case 'NH_PLAN': return <NHForm key="NH_PLAN" initialPhase="plan" {...props} />;
      case 'NH_BUILT': return <NHForm key="NH_BUILT" initialPhase="built" {...props} />;
    }
  };

  const meta = selectedScheme ? SCHEME_META[selectedScheme] : null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <SideNav
        selected={selectedScheme}
        onSelect={handleSchemeSelect}
        onNew={handleNew}
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-5 py-3 bg-white/85 backdrop-blur-md border-b border-slate-100 no-print">
          <button
            onClick={() => setNavOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Pure type in topbar */}
          <span className="hidden sm:block text-[#1B4E4D] font-bold tracking-widest text-sm uppercase shrink-0">
            GREENSHIP
          </span>
          <span className="hidden sm:block text-slate-200 text-sm shrink-0">|</span>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            {meta ? (
              <>
                <span className="material-symbols-outlined text-[#1B4E4D] text-lg shrink-0">{meta.icon}</span>
                <h1 className="text-sm font-semibold text-[#272727] truncate">{meta.title}</h1>
                <span className="hidden sm:inline text-slate-200 mx-1">›</span>
                <span className="hidden sm:inline text-xs text-slate-400 truncate">{meta.desc}</span>
              </>
            ) : (
              <h1 className="text-sm font-semibold text-[#272727]">Fee Calculator</h1>
            )}
          </div>
          <a
            href="https://gbcindonesia.org"
            target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-[#1B4E4D] transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            gbcindonesia.org
          </a>
        </header>

        {/* Main */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl w-full mx-auto">
          {!selectedScheme ? (
            /* ── Welcome ── */
            <div>
              <div className="mb-10">
                {/* Pure typography hero */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B4E4D]/8 mb-5">
                  <span className="material-symbols-outlined text-sm text-[#1B4E4D]">eco</span>
                  <span className="label-sm text-[#1B4E4D]">Green Building Council Indonesia</span>
                </div>
                <h2 className="text-3xl sm:text-[40px] font-bold text-[#272727] leading-tight mb-3">
                  Estimasi Biaya<br />
                  <span className="text-[#1B4E4D]">Sertifikasi GREENSHIP</span>
                </h2>
                <p className="text-slate-500 max-w-lg">
                  Pilih skema sertifikasi untuk memulai kalkulasi biaya. Semua perhitungan mengacu pada tabel biaya resmi GBCI.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
                {WELCOME_SCHEMES.map(item => (
                  <button
                    key={item.scheme}
                    onClick={() => handleSchemeSelect(item.scheme)}
                    className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-[#1B4E4D]/25 hover:shadow-md transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-[#1B4E4D] transition-colors duration-200">
                      <span className="material-symbols-outlined text-xl text-[#1B4E4D] group-hover:text-[#D3FEAB] transition-colors duration-200">
                        {item.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#272727] leading-snug">{item.label}</p>
                      <p className="text-xs text-[#1B4E4D]/70 font-medium mt-0.5">{item.code}</p>
                    </div>
                    <span className="material-symbols-outlined text-base text-slate-200 ml-auto group-hover:text-[#1B4E4D] group-hover:translate-x-0.5 transition-all shrink-0">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1B4E4D]/8 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-[#1B4E4D]">info</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#272727] mb-1">Informasi Penting</p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Kalkulasi ini merupakan estimasi berdasarkan tabel biaya resmi GBCI. Belum termasuk biaya akomodasi verifikator untuk project di luar Jabodetabek.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Calculator ── */
            <div className="calc-grid grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <div className="form-card bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                  <div className="w-9 h-9 rounded-lg bg-[#1B4E4D] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#D3FEAB] text-lg">{meta!.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#272727]">{meta!.title}</p>
                    <p className="text-xs text-slate-400">{meta!.desc}</p>
                  </div>
                </div>
                <div className="p-6">{renderForm()}</div>
              </div>

              <div className="result-card bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-sm font-semibold text-[#272727]">Hasil Kalkulasi</p>
                </div>
                <div className="p-6">
                  {result ? (
                    <ResultPanel result={result} />
                  ) : (
                    <div className="min-h-[280px] flex flex-col items-center justify-center text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-slate-300">calculate</span>
                      </div>
                      <p className="text-sm font-medium text-slate-400 mb-1">Isi data input di sebelah kiri</p>
                      <p className="text-xs text-slate-300">Estimasi biaya akan tampil secara otomatis</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
