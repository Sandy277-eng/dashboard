import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Google Sheets API Configuration
const API_KEY = 'AIzaSyBItOEnfIr0jZvqwfA31PCZuF-BK3-OqzA';
const SHEET_ID = '147SwmzfHZZzEbWlwBBVYfXqgwJonSXekdN_iE9O9O0c';
const PERSONAL_RANGE = 'PERSONAL!A2:E';
const ADMIN_PASSWORD = 'admin123';

// Fetch Data Function
const fetchData = async (range) => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error(error.message || 'Error fetching data');
  }
};

export default function Dashboard() {
  const [personalData, setPersonalData] = useState([]);
  const [filters, setFilters] = useState({ region: '', class: '', marks: '' });
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');
    fetchData(PERSONAL_RANGE)
      .then((personal) => {
        setPersonalData(personal);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch data. Please check your API key, sheet ID, and sheet/tab names.');
        setLoading(false);
      });
  }, [isAdmin]);

  const filterData = (data) => {
    return data.filter((row) => {
      const region = row[2] || '';
      const studentClass = row[3] || '';
      const name = (row[1] || '').toLowerCase();

      return (
        (!filters.region || region.toLowerCase().includes(filters.region.toLowerCase())) &&
        (!filters.class || studentClass.toLowerCase().includes(filters.class.toLowerCase())) &&
        (!searchName || name.includes(searchName.toLowerCase()))
      );
    });
  };

  const renderVerticalData = (data, headers) => {
    const filtered = filterData(data);
    if (filtered.length === 0) {
      return <div className="text-gray-500">No data found.</div>;
    }
    return (
      <div className="space-y-4">
        {filtered.map((row, idx) => (
          <div key={idx} className="border rounded-lg p-4 shadow">
            {headers.map((header, index) => (
              <div key={index} className="flex justify-between border-b py-1">
                <span className="font-semibold">{header}:</span>
                <span>{row[index] || '-'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Admin Login View
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
        <div className="bg-white p-8 rounded shadow-lg space-y-4">
          <h2 className="text-xl font-bold">Admin Login</h2>
          <input
            type="password"
            className="border p-2 rounded w-full"
            placeholder="Enter admin password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (passwordInput === ADMIN_PASSWORD) setIsAdmin(true);
                else alert('Incorrect password');
              }
            }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            onClick={() => {
              if (passwordInput === ADMIN_PASSWORD) setIsAdmin(true);
              else alert('Incorrect password');
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">College Dashboard - Personal Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Filter by Region"
          value={filters.region}
          onChange={(e) => setFilters({ ...filters, region: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Filter by Class"
          value={filters.class}
          onChange={(e) => setFilters({ ...filters, class: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Search by Student Name"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
      </div>

      {loading && <div className="text-blue-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        renderVerticalData(personalData, ['ID', 'Name', 'Region', 'Class', 'Email'])
      )}
    </div>
  );
}
