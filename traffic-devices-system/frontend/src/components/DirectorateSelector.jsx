import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function DirectorateSelector() {
  const { isCentral, selectedDirectorate, setSelectedDirectorate } = useAuth();
  const [directorates, setDirectorates] = useState([]);

  useEffect(() => {
    if (isCentral) api.getDirectorates().then(setDirectorates);
  }, [isCentral]);

  if (!isCentral) return null;

  return (
    <div className="scope-selector">
      <label htmlFor="directorate-scope">نطاق العرض</label>
      <select
        id="directorate-scope"
        value={selectedDirectorate}
        onChange={(e) => setSelectedDirectorate(e.target.value)}
      >
        <option value="">الموقف الموحد — جميع المديريات</option>
        {directorates.map((d) => (
          <option key={d.id} value={d.id}>{d.name_ar}</option>
        ))}
      </select>
    </div>
  );
}
