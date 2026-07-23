import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { labels } from '../api';
import DirectorateSelector from './DirectorateSelector';
import { navIconMap, IconLogout, IconMenu } from './ui/Icons';

const navItems = [
  { to: '/', label: 'لوحة التحكم', iconKey: 'dashboard' },
  { to: '/search', label: 'البحث', iconKey: 'search' },
  { to: '/devices', label: 'مخزن الأجهزة', iconKey: 'devices', hideForLiaison: true },
  { to: '/liaison', label: 'واجهة المديرية', iconKey: 'liaison', liaisonOnly: true },
  { to: '/reports', label: 'التقارير', iconKey: 'reports', hideForLiaison: true },
  { to: '/books', label: 'الكتب الرسمية', iconKey: 'books', hideForLiaison: true },
  { to: '/brands', label: 'الشركات والموديلات', iconKey: 'brands', hideForLiaison: true },
  { to: '/users', label: 'المستخدمون', iconKey: 'users', adminOnly: true },
];

const pageTitles = {
  '/': 'لوحة التحكم',
  '/search': 'البحث عن الأجهزة',
  '/devices': 'مخزن الأجهزة',
  '/liaison': 'واجهة المديرية',
  '/reports': 'التقارير',
  '/books': 'الكتب الرسمية',
  '/brands': 'الشركات والموديلات',
  '/users': 'المستخدمون',
};

export default function Layout() {
  const { user, logout, isAdmin, isCentral, isLiaison } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = navItems.filter((i) => {
    if (i.adminOnly && !isAdmin) return false;
    if (i.liaisonOnly && !isLiaison) return false;
    if (i.hideForLiaison && isLiaison) return false;
    return true;
  });

  const currentTitle = pageTitles[location.pathname] || 'نظام الأجهزة';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-backdrop" onClick={closeSidebar} aria-hidden />

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">📡</div>
          <div>
            <h1>نظام الأجهزة اللاسلكية</h1>
            <p>مديرية المرور العامة — العراق</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleNav.map((item) => {
            const Icon = navIconMap[item.iconKey];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">{Icon && <Icon />}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.full_name?.charAt(0) || '?'}</div>
            <div className="user-meta">
              <div className="name">{user?.full_name}</div>
              <div className="role">{labels.roles[user?.role]}</div>
              {user?.directorate && !isCentral && (
                <div className="directorate">{user.directorate.name_ar}</div>
              )}
            </div>
          </div>
          <button
            type="button"
            className="logout-btn"
            onClick={() => { logout(); navigate('/login'); }}
          >
            <IconLogout />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-start">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="فتح القائمة"
            >
              <IconMenu />
            </button>
            <div className="topbar-title">
              <span className="topbar-breadcrumb">نظام الأجهزة</span>
              <span className="topbar-page">{currentTitle}</span>
            </div>
          </div>
          <div className="topbar-end">
            <DirectorateSelector />
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
