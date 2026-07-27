export default function LoadingSpinner({ label = 'جاري التحميل...' }) {
  return (
    <div className="loading-state">
      <div className="spinner" aria-hidden />
      <p>{label}</p>
    </div>
  );
}
