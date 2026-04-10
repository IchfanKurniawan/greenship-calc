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
  name: '', units: 0,
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
  }, []);

  useEffect(() => { recalculate(types); }, [types]);

  const updateType = (id: string, field: 'name' | 'units', value: string) => {
    setTypes(prev => prev.map(t =>
      t.id === id
        ? { ...t, [field]: field === 'units' ? (parseInt(value) || 0) : value }
        : t
    ));
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

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-600">
          {error}
        </div>
      )}

      <div>
        <div className="grid grid-cols-12 gap-2 mb-2 px-1">
          <span className="col-span-6 label-sm text-slate-400">Nama Tipe</span>
          <span className="col-span-4 label-sm text-slate-400">Jumlah Unit</span>
          <span className="col-span-2"></span>
        </div>

        <div className="flex flex-col gap-2">
          {types.map((type, idx) => {
            const activeRank = activeTypes.findIndex(a => a.id === type.id);
            const discLabel = activeRank === 0 ? '100%' : activeRank <= 2 ? '75%' : activeRank > 2 ? '60%' : '';
            return (
              <div key={type.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border transition-all ${type.units > 0 ? 'bg-[#F0FBF0] border-[#1B4E4D]/15' : 'bg-slate-50 border-slate-100'}`}>
                <div className="col-span-1 flex items-center justify-center">
                  <span className="label-sm text-slate-400">{idx + 1}</span>
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    value={type.name}
                    onChange={e => updateType(type.id, 'name', e.target.value.slice(0, 50))}
                    placeholder={`Tipe ${idx + 1}`}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4E4D]/30 focus:border-[#1B4E4D] transition-all"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    value={type.units || ''}
                    onChange={e => updateType(type.id, 'units', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4E4D]/30 focus:border-[#1B4E4D] transition-all"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  {type.units > 0 && discLabel && (
                    <span className="label-sm text-[#1B4E4D]">{discLabel}</span>
                  )}
                  {types.length > 1 && (
                    <button onClick={() => removeType(type.id)}
                      className="ml-auto p-1 text-slate-300 hover:text-red-400 transition-colors rounded">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>
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

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        {[
          { label: 'Tipe Aktif', value: activeTypes.length.toString() },
          { label: 'Cap Sertifikasi', value: 'Rp 200 Jt' },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-sm font-medium text-[#1B4E4D]">{s.value}</p>
          </div>
        ))}
      </div>
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
