import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { labels } from '../api';

const navItems = [
  { to: '/', label: 'لوحة التحكم', icon: '📊' },
  { to: '/devices', label: 'مخزن الأجهزة', icon: '📻' },
  { to: '/books', label: 'الكتب الرسمية', icon: '📋' },
  { to: '/brands', label: 'الشركات والموديلات', icon: '🏭' },
  { to: '/users', label: 'المستخدمون', icon: '👥', adminOnly: true },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>نظام إدارة أجهزة الاتصالات</h1>
          <p>مديرية المرور - العراق</p>
        </div>
        <nav>
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="user-info">
          <div className="name">{user?.full_name}</div>
          <div className="role">{labels.roles[user?.role]}</div>
          <button className="logout-btn" onClick={handleLogout}>
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
