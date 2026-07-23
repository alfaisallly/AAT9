export default function PageHeader({ title, subtitle, children, badge }) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        {badge && <span className="page-badge">{badge}</span>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}
