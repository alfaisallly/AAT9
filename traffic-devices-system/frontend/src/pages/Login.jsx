import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Login() {
  const { user, login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="login-page"><LoadingSpinner /></div>;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className="login-brand-content">
          <div className="brand-logo">📡</div>
          <h1>نظام إدارة الأجهزة اللاسلكية</h1>
          <p>
            منصة موحّدة لإدارة ومتابعة أجهزة الاتصالات في مديرية المرور العامة —
            بغداد وجميع محافظات العراق.
          </p>
          <div className="login-brand-features">
            <div className="login-feature"><span className="login-feature-dot" />إدارة مخزون الأجهزة والحركات</div>
            <div className="login-feature"><span className="login-feature-dot" />بحث بالرقم المصنعي والمديرية</div>
            <div className="login-feature"><span className="login-feature-dot" />تقارير وجاهزية احترافية</div>
            <div className="login-feature"><span className="login-feature-dot" />توثيق الكتب الرسمية والتعديلات</div>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-card">
          <h2>تسجيل الدخول</h2>
          <p className="subtitle">أدخل بيانات حسابك للوصول إلى النظام</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="username">اسم المستخدم</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="أدخل اسم المستخدم"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password">كلمة المرور</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'جاري الدخول...' : 'دخول إلى النظام'}
            </button>
          </form>
          <div className="login-hint">
            <strong>حسابات تجريبية:</strong><br />
            مركزي: admin / admin123<br />
            الكرخ: karkh / karkh123<br />
            مسؤول مديرية: liaison / liaison123
          </div>
        </div>
      </div>
    </div>
  );
}
