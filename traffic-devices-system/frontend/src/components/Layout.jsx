import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { labels } from '../api';
import DirectorateSelector from './DirectorateSelector';

const navItems = [
  { to: '/', label: 'لوحة التحكم', icon: '📊' },
  { to: '/devices', label: 'مخزن الأجهزة', icon: '📻' },
  { to: '/reports', label: 'التقارير', icon: '📈' },
  { to: '/books', label: 'الكتب الرسمية', icon: '📋' },
  { to: '/brands', label: 'الشركات والموديلات', icon: '🏭' },
  { to: '/users', label: 'المستخدمون', icon: '👥', adminOnly: true },
];

export default function Layout() {
  const { user, logout, isAdmin, isCentral } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>نظام الأجهزة اللاسلكية</h1>
          <p>مديرية المرور العامة — العراق</p>
        </div>
        <nav>
          {navItems.filter((i) => !i.adminOnly || isAdmin).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="user-info">
          <div className="name">{user?.full_name}</div>
          <div className="role">{labels.roles[user?.role]}</div>
          {user?.directorate && !isCentral && (
            <div className="role" style={{ marginTop: '0.25rem' }}>{user.directorate.name_ar}</div>
          )}
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>تسجيل الخروج</button>
        </div>
      </aside>
      <main className="main-content">
        <DirectorateSelector />
        <Outlet />
      </main>
    </div>
  );
}
