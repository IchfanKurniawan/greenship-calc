import { useState, useEffect } from 'react';
import NumberInput from './NumberInput';
import { calculateNBEB } from '../../engine/calculator';
import type { BuildingFunction, CalculationResult } from '../../engine/types';

interface Props {
  scheme: 'NB' | 'EB';
  onResult: (result: CalculationResult | null) => void;
}

const NBEBForm: React.FC<Props> = ({ scheme, onResult }) => {
  const [area, setArea] = useState('');
  const [buildingFunc, setBuildingFunc] = useState<BuildingFunction>('office');
  const [error, setError] = useState('');

  useEffect(() => {
    setArea('');
    setError('');
    onResult(null);
  }, [scheme]);

  useEffect(() => {
    if (!area) { onResult(null); return; }
    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) { setError('Masukkan luas yang valid.'); onResult(null); return; }
    try {
      setError('');
      const result = calculateNBEB({ area: areaNum, buildingFunction: buildingFunc, scheme });
      onResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
      onResult(null);
    }
  }, [area, buildingFunc, scheme]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-sm text-[#1B4E4D] mb-3">Fungsi Bangunan</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'office', label: 'Perkantoran' },
            { value: 'commercial', label: 'Komersial / Kesehatan / Hospitality' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setBuildingFunc(opt.value as BuildingFunction)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                buildingFunc === opt.value
                  ? 'bg-[#1B4E4D] text-[#D3FEAB] border-[#1B4E4D]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#1B4E4D]/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <NumberInput
        label="Luas Area (GFA)"
        value={area}
        onChange={setArea}
        unit="m²"
        placeholder="0.000"
        min={250}
        required
        hint="Minimum 250 m². Untuk area > 150.000 m², biaya tambahan berlaku."
        error={error}
      />
    </div>
  );
};

export default NBEBForm;
