const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'حدث خطأ' }));
    throw new Error(error.detail || 'حدث خطأ');
  }

  if (response.status === 204) return null;
  return response.json();
}

async function downloadFile(path, filename) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'حدث خطأ' }));
    throw new Error(error.detail || 'حدث خطأ');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && query.append(k, v));
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  login: (username, password) =>
    request('/auth/login-json', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => request('/auth/me'),

  getStats: (provinceId) =>
    request(`/dashboard/stats${provinceId ? `?province_id=${provinceId}` : ''}`),

  getProvinces: () => request('/provinces/'),
  getUsers: () => request('/users/'),
  createUser: (data) => request('/users/', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  getBrands: () => request('/brands/'),
  createBrand: (data) => request('/brands/', { method: 'POST', body: JSON.stringify(data) }),
  getModels: () => request('/brands/models'),
  createModel: (data) => request('/brands/models', { method: 'POST', body: JSON.stringify(data) }),

  getDevices: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && query.append(k, v));
    return request(`/devices/?${query.toString()}`);
  },
  createDevice: (data) => request('/devices/', { method: 'POST', body: JSON.stringify(data) }),
  updateDevice: (id, data) => request(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),

  getBooks: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && query.append(k, v));
    return request(`/books/?${query.toString()}`);
  },
  createBook: (data) => request('/books/', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id, data) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  exportDevicesExcel: (params = {}) =>
    downloadFile(`/export/devices/excel${buildQuery(params)}`, 'devices_report.xlsx'),

  exportDevicesPdf: (params = {}) =>
    downloadFile(`/export/devices/pdf${buildQuery(params)}`, 'devices_report.pdf'),

  exportBooksExcel: (params = {}) =>
    downloadFile(`/export/books/excel${buildQuery(params)}`, 'official_books.xlsx'),

  exportBookPdf: (bookId) =>
    downloadFile(`/export/books/${bookId}/pdf`, `book_${bookId}.pdf`),

  exportDashboardPdf: (provinceId) =>
    downloadFile(`/export/dashboard/pdf${buildQuery({ province_id: provinceId })}`, 'dashboard_report.pdf'),
};

export const labels = {
  roles: {
    admin: 'مدير النظام',
    manager: 'مدير',
    operator: 'مشغّل',
  },
  deviceTypes: {
    desktop: 'جهاز مكتبي',
    mobile: 'جهاز محمول',
    wheel: 'جهاز عجلة',
  },
  deviceStatus: {
    working: 'يعمل',
    consumed_non_disabled: 'مستهلك غير معطل',
    consumed_disabled: 'مستهلك معطل',
  },
  bookTypes: {
    receipt: 'استلام',
    delivery: 'تسليم',
  },
};

export function statusBadgeClass(status) {
  return {
    working: 'badge-success',
    consumed_non_disabled: 'badge-warning',
    consumed_disabled: 'badge-danger',
  }[status] || 'badge-default';
}
