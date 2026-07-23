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
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('token');
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
  if (!response.ok) throw new Error('حدث خطأ');
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
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && query.append(k, v));
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  login: (username, password) =>
    request('/auth/login-json', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getMe: () => request('/auth/me'),

  getStats: (directorateId) =>
    request(`/dashboard/stats${buildQuery({ directorate_id: directorateId })}`),

  getDirectorates: () => request('/directorates/'),
  getProvinces: () => request('/provinces/'),

  getReportSummary: (directorateId) =>
    request(`/reports/summary${buildQuery({ directorate_id: directorateId })}`),

  getReportCentral: () => request('/reports/central'),
  getReportDirectorate: (id) => request(`/reports/directorate/${id}`),

  getUsers: () => request('/users/'),
  createUser: (data) => request('/users/', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  getBrands: () => request('/brands/'),
  createBrand: (data) => request('/brands/', { method: 'POST', body: JSON.stringify(data) }),
  getModels: () => request('/brands/models'),
  createModel: (data) => request('/brands/models', { method: 'POST', body: JSON.stringify(data) }),

  getDevices: (params = {}) => request(`/devices/${buildQuery(params)}`),
  createDevice: (data) => request('/devices/', { method: 'POST', body: JSON.stringify(data) }),
  updateDevice: (id, data) => request(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),
  addDeviceDocument: (deviceId, data) =>
    request(`/devices/${deviceId}/documents`, { method: 'POST', body: JSON.stringify(data) }),

  getBooks: (params = {}) => request(`/books/${buildQuery(params)}`),
  createBook: (data) => request('/books/', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id, data) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  getInventory: (params = {}) => request(`/inventory/${buildQuery(params)}`),
  createInventoryMovement: (data) =>
    request('/inventory/', { method: 'POST', body: JSON.stringify(data) }),

  exportDevicesExcel: (params = {}) =>
    downloadFile(`/export/devices/excel${buildQuery(params)}`, 'devices_report.xlsx'),
  exportDevicesPdf: (params = {}) =>
    downloadFile(`/export/devices/pdf${buildQuery(params)}`, 'devices_report.pdf'),
  exportBooksExcel: (params = {}) =>
    downloadFile(`/export/books/excel${buildQuery(params)}`, 'official_books.xlsx'),
  exportBookPdf: (bookId) =>
    downloadFile(`/export/books/${bookId}/pdf`, `book_${bookId}.pdf`),
  exportDashboardPdf: (directorateId) =>
    downloadFile(`/export/dashboard/pdf${buildQuery({ directorate_id: directorateId })}`, 'dashboard_report.pdf'),
};

export const labels = {
  roles: {
    super_admin: 'مدير النظام المركزي',
    admin: 'مدير',
    manager: 'مدير مديرية',
    operator: 'مستخدم اعتيادي',
  },
  deviceTypes: {
    desktop: 'مكتبي',
    mobile: 'محمول',
    wheel: 'عجلة',
  },
  deviceStatus: {
    working: 'يصلح للعمل',
    consumed: 'مستهلك - لا يصلح للعمل',
  },
  documentTypes: {
    acquisition: 'اشتباك / تمليك',
    receipt: 'استلام',
    delivery: 'تسليم',
    maintenance: 'صيانة',
    transfer: 'نقل',
    disposal: 'إتلاف',
  },
  bookTypes: { receipt: 'استلام', delivery: 'تسليم' },
  movementTypes: {
    in: 'إدخال', out: 'إخراج', transfer: 'نقل', status_change: 'تغيير حالة',
  },
};

export function statusBadgeClass(status) {
  if (status === 'working') return 'badge-success';
  return 'badge-danger';
}
