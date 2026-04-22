import { useEffect, useMemo, useState } from 'react';
import NumberInput from './NumberInput';
import { calculateNBEB } from '../../engine/calculator';
import type { BuildingFunction, CalculationResult } from '../../engine/types';

interface Props {
  scheme: 'NB' | 'EB';
  onResult: (result: CalculationResult | null) => void;
}

function getNBEBState(
  area: string,
  buildingFunction: BuildingFunction,
  scheme: 'NB' | 'EB',
): { error: string; result: CalculationResult | null } {
  if (!area) {
    return { error: '', result: null };
  }

  const areaValue = Number(area);

  if (!Number.isFinite(areaValue) || areaValue <= 0) {
    return { error: 'Masukkan luas yang valid.', result: null };
  }

  try {
    return {
      error: '',
      result: calculateNBEB({ area: areaValue, buildingFunction, scheme }),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      result: null,
    };
  }
}

const NBEBForm: React.FC<Props> = ({ scheme, onResult }) => {
  const [area, setArea] = useState('');
  const [buildingFunc, setBuildingFunc] = useState<BuildingFunction>('office');

  const { error, result } = useMemo(
    () => getNBEBState(area, buildingFunc, scheme),
    [area, buildingFunc, scheme],
  );

  useEffect(() => {
    onResult(result);
  }, [onResult, result]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-sm text-[#1B4E4D] mb-3">Fungsi Bangunan</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'office', label: 'Perkantoran' },
            { value: 'commercial', label: 'Komersial / Kesehatan / Hospitality' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setBuildingFunc(option.value as BuildingFunction)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                buildingFunc === option.value
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
    </div>
  );
};

export default NBEBForm;
