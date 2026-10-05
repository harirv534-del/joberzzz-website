import React from 'react';
import { INDIA_STATES, getDistricts, getAreas } from '../../lib/indiaLocations';

export interface LocationValue {
  state: string;
  district: string;
  area: string;
}

interface LocationSelectProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  /** 'form' = labelled required fields (profile / job posting); 'filter' = compact optional selects for search */
  variant?: 'form' | 'filter';
}

const formSelect =
  'w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed';
const filterSelect =
  'py-1.5 px-2.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer focus:outline-none focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed';

export const LocationSelect: React.FC<LocationSelectProps> = ({ value, onChange, variant = 'form' }) => {
  const districts = getDistricts(value.state);
  const areas = getAreas(value.state, value.district);
  const isForm = variant === 'form';
  const cls = isForm ? formSelect : filterSelect;

  const stateSelect = (
    <select
      value={value.state}
      onChange={e => onChange({ state: e.target.value, district: '', area: '' })}
      className={cls}
      aria-label="State"
    >
      <option value="">{isForm ? 'Select State' : 'All States'}</option>
      {INDIA_STATES.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );

  const districtSelect = (
    <select
      value={value.district}
      onChange={e => onChange({ ...value, district: e.target.value, area: '' })}
      disabled={!value.state}
      className={cls}
      aria-label="District / City"
    >
      <option value="">{isForm ? 'Select District / City' : 'All Districts / Cities'}</option>
      {districts.map(d => (
        <option key={d} value={d}>{d}</option>
      ))}
    </select>
  );

  const areaSelect = (
    <select
      value={value.area}
      onChange={e => onChange({ ...value, area: e.target.value })}
      disabled={!value.district || areas.length === 0}
      className={cls}
      aria-label="Area"
    >
      <option value="">
        {value.district && areas.length === 0 ? 'No areas listed' : isForm ? 'Select Area' : 'All Areas'}
      </option>
      {areas.map(a => (
        <option key={a} value={a}>{a}</option>
      ))}
    </select>
  );

  if (!isForm) {
    return (
      <>
        {stateSelect}
        {districtSelect}
        {areaSelect}
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
        {stateSelect}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">District / City *</label>
        {districtSelect}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Area (Optional)</label>
        {areaSelect}
      </div>
    </div>
  );
};
