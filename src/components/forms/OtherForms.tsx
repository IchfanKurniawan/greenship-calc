import { useEffect, useMemo, useState } from 'react';
import NumberInput from './NumberInput';
import {
  calculateHomesA,
  calculateHomesB,
  calculateIS,
  calculateNH,
  calculateTS,
} from '../../engine/calculator';
import { HOMES_B_MAX_TYPES, SQM_TO_HA } from '../../engine/constants';
import type { BuildingFunction, CalculationResult, HomeType, NHUnit } from '../../engine/types';

function parsePositiveNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'Terjadi kesalahan.';
}

interface ISFormProps {
  onResult: (result: CalculationResult | null) => void;
}

export const ISForm: React.FC<ISFormProps> = ({ onResult }) => {
  const [area, setArea] = useState('');
  const [func, setFunc] = useState<BuildingFunction>('office');

  const { error, result } = useMemo(() => {
    const areaValue = parsePositiveNumber(area);
    let nextError = '';
    let nextResult: CalculationResult | null = null;

    if (area) {
      if (areaValue === null || areaValue <= 0) {
        nextError = 'Masukkan luas yang valid.';
      } else {
        try {
          nextResult = calculateIS({ area: areaValue, buildingFunction: func });
        } catch (calculationError) {
          nextError = formatError(calculationError);
        }
      }
    }

    return { error: nextError, result: nextResult };
  }, [area, func]);

  useEffect(() => {
    onResult(result);
  }, [onResult, result]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-sm text-[#1B4E4D] mb-3">Fungsi Ruang</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'office', label: 'Perkantoran' },
            { value: 'commercial', label: 'Komersial / Kesehatan / Hospitality' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFunc(option.value as BuildingFunction)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                func === option.value
                  ? 'bg-[#1B4E4D] text-[#D3FEAB] border-[#1B4E4D]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#1B4E4D]/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <NumberInput
        label="Luas Ruang Interior"
        value={area}
        onChange={setArea}
        unit="m2"
        placeholder="0.000"
        min={25}
        required
        hint="Minimum 25 m2."
        error={error}
      />
    </div>
  );
};

interface TSFormProps {
  onResult: (result: CalculationResult | null) => void;
}

export const TSForm: React.FC<TSFormProps> = ({ onResult }) => {
  const [area, setArea] = useState('');

  const { error, result } = useMemo(() => {
    const areaValue = parsePositiveNumber(area);
    let nextError = '';
    let nextResult: CalculationResult | null = null;

    if (area) {
      if (areaValue === null || areaValue <= 0) {
        nextError = 'Masukkan luas yang valid.';
      } else {
        try {
          nextResult = calculateTS({ area: areaValue });
        } catch (calculationError) {
          nextError = formatError(calculationError);
        }
      }
    }

    return { error: nextError, result: nextResult };
  }, [area]);

  useEffect(() => {
    onResult(result);
  }, [onResult, result]);

  return (
    <NumberInput
      label="Luas Area (GFA)"
      value={area}
      onChange={setArea}
      unit="m2"
      placeholder="0.000"
      min={250}
      required
      hint="Minimum 250 m2. Untuk area > 150.000 m2, biaya tambahan berlaku."
      error={error}
    />
  );
};

interface HomesAFormProps {
  onResult: (result: CalculationResult | null) => void;
}

export const HomesAForm: React.FC<HomesAFormProps> = ({ onResult }) => {
  const [area, setArea] = useState('');

  const { error, result } = useMemo(() => {
    const areaValue = parsePositiveNumber(area);
    let nextError = '';
    let nextResult: CalculationResult | null = null;

    if (area) {
      if (areaValue === null || areaValue <= 0) {
        nextError = 'Masukkan luas yang valid.';
      } else {
        try {
          nextResult = calculateHomesA({ floorArea: areaValue });
        } catch (calculationError) {
          nextError = formatError(calculationError);
        }
      }
    }

    return { error: nextError, result: nextResult };
  }, [area]);

  useEffect(() => {
    onResult(result);
  }, [onResult, result]);

  return (
    <NumberInput
      label="Luas Lantai Rumah"
      value={area}
      onChange={setArea}
      unit="m2"
      placeholder="0.000"
      min={1}
      required
      hint="Luas bangunan (bukan luas tanah). Kategori: <= 100 m2 / 101-200 m2 / > 200 m2."
      error={error}
    />
  );
};

interface HomesBFormProps {
  onResult: (result: CalculationResult | null) => void;
}

const emptyType = (): HomeType => ({
  id: Math.random().toString(36).slice(2),
  name: '',
  units: 0,
  floorArea: 0,
});

export const HomesBForm: React.FC<HomesBFormProps> = ({ onResult }) => {
  const [types, setTypes] = useState<HomeType[]>([emptyType(), emptyType()]);

  const activeTypes = types.filter(type => type.units > 0);
  const hasMissingFloorArea = activeTypes.some(type => type.floorArea <= 0);
  const canCalculate = activeTypes.length > 0 && !hasMissingFloorArea;

  const { error, result } = useMemo(() => {
    let nextError = '';
    let nextResult: CalculationResult | null = null;

    if (activeTypes.length > 0) {
      if (hasMissingFloorArea) {
        nextError = 'Isi luas lantai untuk setiap tipe aktif sebelum kalkulasi dapat dilakukan.';
      } else {
        try {
          nextResult = calculateHomesB({ types });
        } catch (calculationError) {
          nextError = formatError(calculationError);
        }
      }
    }

    return { error: nextError, result: nextResult };
  }, [activeTypes.length, hasMissingFloorArea, types]);

  useEffect(() => {
    onResult(result);
  }, [onResult, result]);

  const weightedAvg = canCalculate
    ? activeTypes.reduce((sum, type) => sum + type.units * type.floorArea, 0)
      / activeTypes.reduce((sum, type) => sum + type.units, 0)
    : null;

  const multiplierLabel = weightedAvg === null
    ? 'Lengkapi luas'
    : weightedAvg <= 100
      ? 'x1.000 (Kecil)'
      : weightedAvg <= 200
        ? 'x1.100 (Menengah)'
        : 'x1.175 (Besar)';

  const baseInputClass = 'w-full h-9 px-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4E4D]/30 focus:border-[#1B4E4D] transition-all';
  const getInputClass = (hasErrorState = false) => `${baseInputClass} ${hasErrorState ? 'border-orange-400 bg-orange-50' : 'border-slate-200'}`;

  const updateType = (id: string, field: 'name' | 'units' | 'floorArea', value: string) => {
    setTypes(previous =>
      previous.map(type => {
        if (type.id !== id) {
          return type;
        }

        if (field === 'name') {
          return { ...type, name: value };
        }

        if (field === 'units') {
          return { ...type, units: Number.parseInt(value, 10) || 0 };
        }

        return { ...type, floorArea: Number.parseFloat(value) || 0 };
      }),
    );
  };

  const addType = () => {
    if (types.length >= HOMES_B_MAX_TYPES) {
      return;
    }

    setTypes(previous => [...previous, emptyType()]);
  };

  const removeType = (id: string) => {
    if (types.length <= 1) {
      return;
    }

    setTypes(previous => previous.filter(type => type.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-600">
          {error}
        </div>
      )}

      <p className="text-xs text-slate-400">
        Setiap tipe aktif wajib memiliki jumlah unit dan luas lantai sebelum kalkulasi dapat dilakukan.
      </p>

      <div>
        <div className="grid gap-1.5 mb-1.5 px-1" style={{ gridTemplateColumns: '1.2rem 1fr 4rem 5rem 1.5rem' }}>
          <span />
          <span className="label-sm text-slate-400">Nama Tipe</span>
          <span className="label-sm text-slate-400 text-center">Unit</span>
          <span className="label-sm text-slate-400 text-center">Luas (m2)</span>
          <span />
        </div>

        <div className="flex flex-col gap-1.5">
          {types.map((type, index) => {
            const activeRank = activeTypes.findIndex(activeType => activeType.id === type.id);
            const isActive = type.units > 0;
            const needsFloorArea = isActive && type.floorArea <= 0;
            const discountLabel = activeRank === 0 ? '100%' : activeRank <= 2 ? '75%' : activeRank > 2 ? '60%' : '';

            return (
              <div
                key={type.id}
                className={`grid gap-1.5 items-center p-1.5 rounded-lg border transition-all ${
                  isActive ? 'bg-[#F0FBF0] border-[#1B4E4D]/15' : 'bg-slate-50 border-slate-100'
                }`}
                style={{ gridTemplateColumns: '1.2rem 1fr 4rem 5rem 1.5rem' }}
              >
                <span className="label-sm text-slate-400 text-center">{index + 1}</span>

                <input
                  type="text"
                  value={type.name}
                  onChange={event => updateType(type.id, 'name', event.target.value.slice(0, 50))}
                  placeholder={`Tipe ${index + 1}`}
                  className={getInputClass()}
                />

                <div className="relative">
                  <input
                    type="number"
                    value={type.units || ''}
                    onChange={event => updateType(type.id, 'units', event.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className={getInputClass()}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                  {isActive && discountLabel && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-[#1B4E4D] bg-[#D3FEAB] px-1 rounded whitespace-nowrap">
                      {discountLabel}
                    </span>
                  )}
                </div>

                <input
                  type="number"
                  value={type.floorArea || ''}
                  onChange={event => updateType(type.id, 'floorArea', event.target.value)}
                  placeholder="0.000"
                  min="0"
                  step="0.001"
                  className={getInputClass(needsFloorArea)}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                />

                {types.length > 1 ? (
                  <button
                    onClick={() => removeType(type.id)}
                    className="flex items-center justify-center p-0.5 text-slate-300 hover:text-red-400 transition-colors rounded"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {types.length < HOMES_B_MAX_TYPES && (
        <button
          onClick={addType}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#1B4E4D] border border-dashed border-[#1B4E4D]/40 rounded-lg hover:bg-[#1B4E4D]/5 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Tambah Tipe ({types.length}/{HOMES_B_MAX_TYPES})
        </button>
      )}

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

      {weightedAvg !== null ? (
        <p className="text-xs text-slate-400 -mt-1">
          Rata-rata tertimbang: <span className="font-medium text-[#1B4E4D]">{weightedAvg.toFixed(1)} m2</span>
        </p>
      ) : activeTypes.length > 0 ? (
        <p className="text-xs text-orange-500 -mt-1">Lengkapi luas lantai untuk semua tipe aktif agar multiplier bisa dihitung.</p>
      ) : null}
    </div>
  );
};

interface NHFormProps {
  onResult: (result: CalculationResult | null) => void;
  initialPhase?: 'plan' | 'built';
}

export const NHForm: React.FC<NHFormProps> = ({ onResult, initialPhase = 'plan' }) => {
  const [area, setArea] = useState('');
  const [phase, setPhase] = useState<'plan' | 'built'>(initialPhase);
  const [unit, setUnit] = useState<NHUnit>('ha');

  const { error, result } = useMemo(() => {
    const rawArea = parsePositiveNumber(area);
    let nextError = '';
    let nextResult: CalculationResult | null = null;

    if (area) {
      if (rawArea === null || rawArea <= 0) {
        nextError = 'Masukkan luas yang valid.';
      } else {
        const areaInHa = unit === 'sqm' ? rawArea / SQM_TO_HA : rawArea;

        try {
          nextResult = calculateNH({ area: areaInHa, phase });
        } catch (calculationError) {
          nextError = formatError(calculationError);
        }
      }
    }

    return { error: nextError, result: nextResult };
  }, [area, phase, unit]);

  useEffect(() => {
    onResult(result);
  }, [onResult, result]);

  const minDisplay = phase === 'plan'
    ? unit === 'ha' ? '10 ha' : '100.000 m2'
    : unit === 'ha' ? '1 ha' : '10.000 m2';

  const selectPhase = (nextPhase: 'plan' | 'built') => {
    if (phase === nextPhase) {
      return;
    }

    setPhase(nextPhase);
    setArea('');
  };

  const selectUnit = (nextUnit: NHUnit) => {
    if (unit === nextUnit) {
      return;
    }

    setUnit(nextUnit);
    setArea('');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-sm text-[#1B4E4D] mb-3">Fase Sertifikasi</p>
        <div className="flex gap-2">
          {[
            { value: 'plan', label: 'Plan', hint: '10-400+ ha' },
            { value: 'built', label: 'Built', hint: '1-400+ ha' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => selectPhase(option.value as 'plan' | 'built')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                phase === option.value
                  ? 'bg-[#1B4E4D] text-white border-[#1B4E4D]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#1B4E4D]/40'
              }`}
            >
              <p className="text-sm font-medium">{option.label}</p>
              <p className={`text-xs mt-0.5 ${phase === option.value ? 'text-[#D3FEAB]' : 'text-slate-400'}`}>
                {option.hint}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label-sm text-[#1B4E4D] mb-3">Satuan Luas</p>
        <div className="flex gap-2">
          {[
            { value: 'ha', label: 'Hektar (ha)' },
            { value: 'sqm', label: 'Meter Persegi (m2)' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => selectUnit(option.value as NHUnit)}
              className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                unit === option.value
                  ? 'bg-[#D3FEAB] text-[#1B4E4D] border-[#1B4E4D]/30'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <NumberInput
        label="Luas Area Neighborhood"
        value={area}
        onChange={setArea}
        unit={unit === 'ha' ? 'ha' : 'm2'}
        placeholder="0.000"
        min={0.001}
        required
        hint={`Minimum ${minDisplay}. Area > 400 ha: biaya tambahan berlaku.`}
        error={error}
      />
    </div>
  );
};
