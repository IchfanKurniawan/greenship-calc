import { useState, useEffect, useCallback } from 'react';
import NumberInput from './NumberInput';
import { calculateIS, calculateTS, calculateHomesA, calculateHomesB, calculateNH } from '../../engine/calculator';
import { HOMES_B_MAX_TYPES, SQM_TO_HA } from '../../engine/constants';
import type { BuildingFunction, CalculationResult, HomeType, NHUnit } from '../../engine/types';

// ── IS Form ───────────────────────────────────

interface ISFormProps { onResult: (r: CalculationResult | null) => void; }

export const ISForm: React.FC<ISFormProps> = ({ onResult }) => {
  const [area, setArea] = useState('');
  const [func, setFunc] = useState<BuildingFunction>('office');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!area) { onResult(null); return; }
    const n = parseFloat(area);
    if (!n || n <= 0) { setError('Masukkan luas yang valid.'); onResult(null); return; }
    try {
      setError('');
      onResult(calculateIS({ area: n, buildingFunction: func }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error'); onResult(null);
    }
  }, [area, func]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-sm text-[#1B4E4D] mb-3">Fungsi Ruang</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'office', label: 'Perkantoran' },
            { value: 'commercial', label: 'Komersial / Kesehatan / Hospitality' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => setFunc(opt.value as BuildingFunction)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${func === opt.value ? 'bg-[#1B4E4D] text-[#D3FEAB] border-[#1B4E4D]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1B4E4D]/40'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <NumberInput label="Luas Ruang Interior" value={area} onChange={setArea}
        unit="m²" placeholder="0.000" min={25} required
        hint="Minimum 25 m²." error={error} />
    </div>
  );
};

// ── TS Form ───────────────────────────────────

interface TSFormProps { onResult: (r: CalculationResult | null) => void; }

export const TSForm: React.FC<TSFormProps> = ({ onResult }) => {
  const [area, setArea] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!area) { onResult(null); return; }
    const n = parseFloat(area);
    if (!n || n <= 0) { setError('Masukkan luas yang valid.'); onResult(null); return; }
    try {
      setError('');
      onResult(calculateTS({ area: n }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error'); onResult(null);
    }
  }, [area]);

  return (
    <NumberInput label="Luas Area (GFA)" value={area} onChange={setArea}
      unit="m²" placeholder="0.000" min={250} required
      hint="Minimum 250 m². Untuk area > 150.000 m², biaya tambahan berlaku."
      error={error} />
  );
};

// ── Homes A Form ──────────────────────────────

interface HomesAFormProps { onResult: (r: CalculationResult | null) => void; }

export const HomesAForm: React.FC<HomesAFormProps> = ({ onResult }) => {
  const [area, setArea] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!area) { onResult(null); return; }
    const n = parseFloat(area);
    if (!n || n <= 0) { setError('Masukkan luas yang valid.'); onResult(null); return; }
    try {
      setError('');
      onResult(calculateHomesA({ floorArea: n }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error'); onResult(null);
    }
  }, [area]);

  return (
    <NumberInput label="Luas Lantai Rumah" value={area} onChange={setArea}
      unit="m²" placeholder="0.000" min={1} required
      hint="Luas bangunan (bukan luas tanah). Kategori: < 100 m² / 101–200 m² / > 200 m²."
      error={error} />
  );
};

// ── Homes B Form ──────────────────────────────

interface HomesBFormProps { onResult: (r: CalculationResult | null) => void; }

const emptyType = (): HomeType => ({
  id: Math.random().toString(36).slice(2),
  name: '', units: 0, floorArea: 0,
});

export const HomesBForm: React.FC<HomesBFormProps> = ({ onResult }) => {
  const [types, setTypes] = useState<HomeType[]>([emptyType(), emptyType()]);
  const [error, setError] = useState('');

  const recalculate = useCallback((currentTypes: HomeType[]) => {
    const active = currentTypes.filter(t => t.units > 0);
    if (active.length === 0) { onResult(null); return; }
    try {
      setError('');
      onResult(calculateHomesB({ types: currentTypes }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error'); onResult(null);
    }
  }, [onResult]);

  useEffect(() => { recalculate(types); }, [types, recalculate]);

  const updateType = (id: string, field: 'name' | 'units' | 'floorArea', value: string) => {
    setTypes(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (field === 'name') return { ...t, name: value };
      if (field === 'units') return { ...t, units: parseInt(value) || 0 };
      if (field === 'floorArea') return { ...t, floorArea: parseFloat(value) || 0 };
      return t;
    }));
  };

  const addType = () => {
    if (types.length >= HOMES_B_MAX_TYPES) return;
    setTypes(prev => [...prev, emptyType()]);
  };

  const removeType = (id: string) => {
    if (types.length <= 1) return;
    setTypes(prev => prev.filter(t => t.id !== id));
  };

  const activeTypes = types.filter(t => t.units > 0);

  // Live weighted average for display
  const withArea = activeTypes.filter(t => t.floorArea > 0);
  const totalUnits = withArea.reduce((s, t) => s + t.units, 0);
  const weightedAvg = totalUnits > 0
    ? withArea.reduce((s, t) => s + t.units * t.floorArea, 0) / totalUnits
    : null;
  const multiplierLabel = weightedAvg === null ? '—'
    : weightedAvg <= 100 ? '×1.000 (Kecil)'
    : weightedAvg <= 200 ? '×1.100 (Menengah)'
    : '×1.175 (Besar)';

  const inputClass = "w-full h-9 px-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4E4D]/30 focus:border-[#1B4E4D] transition-all";

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-600">
          {error}
        </div>
      )}

      <div>
        {/* Column headers */}
        <div className="grid gap-1.5 mb-1.5 px-1" style={{ gridTemplateColumns: '1.2rem 1fr 4rem 4rem 1.5rem' }}>
          <span></span>
          <span className="label-sm text-slate-400">Nama Tipe</span>
          <span className="label-sm text-slate-400 text-center">Unit</span>
          <span className="label-sm text-slate-400 text-center">Luas (m²)</span>
          <span></span>
        </div>

        <div className="flex flex-col gap-1.5">
          {types.map((type, idx) => {
            const activeRank = activeTypes.findIndex(a => a.id === type.id);
            const discLabel = activeRank === 0 ? '100%' : activeRank <= 2 ? '75%' : activeRank > 2 ? '60%' : '';
            const isActive = type.units > 0;

            return (
              <div key={type.id}
                className={`grid gap-1.5 items-center p-1.5 rounded-lg border transition-all ${isActive ? 'bg-[#F0FBF0] border-[#1B4E4D]/15' : 'bg-slate-50 border-slate-100'}`}
                style={{ gridTemplateColumns: '1.2rem 1fr 4rem 4rem 1.5rem' }}>

                {/* Index */}
                <span className="label-sm text-slate-400 text-center">{idx + 1}</span>

                {/* Name */}
                <input type="text" value={type.name}
                  onChange={e => updateType(type.id, 'name', e.target.value.slice(0, 50))}
                  placeholder={`Tipe ${idx + 1}`}
                  className={inputClass} />

                {/* Units */}
                <div className="relative">
                  <input type="number" value={type.units || ''}
                    onChange={e => updateType(type.id, 'units', e.target.value)}
                    placeholder="0" min="0" step="1"
                    className={inputClass}
                    style={{ fontVariantNumeric: 'tabular-nums' }} />
                  {isActive && discLabel && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-[#1B4E4D] bg-[#D3FEAB] px-1 rounded whitespace-nowrap">
                      {discLabel}
                    </span>
                  )}
                </div>

                {/* Floor area */}
                <input type="number" value={type.floorArea || ''}
                  onChange={e => updateType(type.id, 'floorArea', e.target.value)}
                  placeholder="0.000" min="0" step="0.001"
                  className={inputClass}
                  style={{ fontVariantNumeric: 'tabular-nums' }} />

                {/* Remove */}
                {types.length > 1 ? (
                  <button onClick={() => removeType(type.id)}
                    className="flex items-center justify-center p-0.5 text-slate-300 hover:text-red-400 transition-colors rounded">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                ) : <span />}
              </div>
            );
          })}
        </div>
      </div>

      {types.length < HOMES_B_MAX_TYPES && (
        <button onClick={addType}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#1B4E4D] border border-dashed border-[#1B4E4D]/40 rounded-lg hover:bg-[#1B4E4D]/5 transition-all duration-200">
          <span className="material-symbols-outlined text-base">add</span>
          Tambah Tipe ({types.length}/{HOMES_B_MAX_TYPES})
        </button>
      )}

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
          <p className="text-xs text-slate-400 mb-0.5">Tipe Aktif</p>
          <p className="text-sm font-semibold text-[#1B4E4D]">{activeTypes.length}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
          <p className="text-xs text-slate-400 mb-0.5">Cap Sertifikasi</p>
          <p className="text-sm font-semibold text-[#1B4E4D]">Rp 250 Jt</p>
        </div>
        <div className={`rounded-lg p-2.5 text-center ${weightedAvg !== null ? 'bg-[#F0FBF0]' : 'bg-slate-50'}`}>
          <p className="text-xs text-slate-400 mb-0.5">Multiplier</p>
          <p className="text-xs font-semibold text-[#1B4E4D] leading-tight">{multiplierLabel}</p>
        </div>
      </div>

      {weightedAvg !== null && (
        <p className="text-xs text-slate-400 -mt-1">
          Rata-rata tertimbang: <span className="font-medium text-[#1B4E4D]">{weightedAvg.toFixed(1)} m²</span>
        </p>
      )}
    </div>
  );
};

// ── NH Form ───────────────────────────────────

interface NHFormProps { onResult: (r: CalculationResult | null) => void; }

export const NHForm: React.FC<NHFormProps> = ({ onResult }) => {
  const [area, setArea] = useState('');
  const [phase, setPhase] = useState<'plan' | 'built'>('plan');
  const [unit, setUnit] = useState<NHUnit>('ha');
  const [error, setError] = useState('');

  useEffect(() => {
    setArea('');
    setError('');
    onResult(null);
  }, [phase]);

  useEffect(() => {
    if (!area) { onResult(null); return; }
    const raw = parseFloat(area);
    if (!raw || raw <= 0) { setError('Masukkan luas yang valid.'); onResult(null); return; }
    const areaHa = unit === 'sqm' ? raw / SQM_TO_HA : raw;
    try {
      setError('');
      onResult(calculateNH({ area: areaHa, phase }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error'); onResult(null);
    }
  }, [area, phase, unit]);

  const minDisplay = phase === 'plan'
    ? (unit === 'ha' ? '10 ha' : '100.000 m²')
    : (unit === 'ha' ? '1 ha' : '10.000 m²');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-sm text-[#1B4E4D] mb-3">Fase Sertifikasi</p>
        <div className="flex gap-2">
          {[
            { value: 'plan', label: 'Plan', hint: '10–400+ ha' },
            { value: 'built', label: 'Built', hint: '1–400+ ha' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => setPhase(opt.value as 'plan' | 'built')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${phase === opt.value ? 'bg-[#1B4E4D] text-white border-[#1B4E4D]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1B4E4D]/40'}`}>
              <p className="text-sm font-medium">{opt.label}</p>
              <p className={`text-xs mt-0.5 ${phase === opt.value ? 'text-[#D3FEAB]' : 'text-slate-400'}`}>{opt.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label-sm text-[#1B4E4D] mb-3">Satuan Luas</p>
        <div className="flex gap-2">
          {[
            { value: 'ha', label: 'Hektar (ha)' },
            { value: 'sqm', label: 'Meter Persegi (m²)' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => { setUnit(opt.value as NHUnit); setArea(''); }}
              className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${unit === opt.value ? 'bg-[#D3FEAB] text-[#1B4E4D] border-[#1B4E4D]/30' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <NumberInput
        label={`Luas Area Neighborhood`}
        value={area}
        onChange={setArea}
        unit={unit === 'ha' ? 'ha' : 'm²'}
        placeholder="0.000"
        min={0.001}
        required
        hint={`Minimum ${minDisplay}. Area > 400 ha: biaya tambahan berlaku.`}
        error={error}
      />
    </div>
  );
};
