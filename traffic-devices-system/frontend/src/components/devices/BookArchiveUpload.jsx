import { useRef, useState } from 'react';
import { api } from '../../api';

export default function BookArchiveUpload({ bookNumber, setBookNumber, bookFile, setBookFile, required = false }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const result = await api.uploadOfficialBook(file);
      setUploaded(result);
      setBookFile(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="book-archive-section">
      <h4>📄 أرشفة الكتاب الرسمي {required && <span style={{ color: 'var(--danger)' }}>*</span>}</h4>
      <p className="field-hint">إلزامي لمسؤول المديرية — صورة الكتاب الذي بموجبه تم التعديل</p>
      <div className="form-grid">
        <div className="form-group">
          <label>رقم الكتاب الرسمي {required && '*'}</label>
          <input
            value={bookNumber}
            onChange={(e) => setBookNumber(e.target.value)}
            placeholder="رقم الكتاب"
            required={required}
          />
        </div>
        <div className="form-group">
          <label>صورة الكتاب {required && '*'}</label>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.webp"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          {uploading && <span className="field-hint">جاري الرفع...</span>}
          {uploaded && <span className="field-hint" style={{ color: 'var(--success)' }}>✓ تم رفع: {uploaded.filename}</span>}
          {error && <span className="field-hint" style={{ color: 'var(--danger)' }}>{error}</span>}
        </div>
      </div>
    </div>
  );
}

export function getBookMeta(bookNumber, bookFile) {
  if (!bookFile) return {};
  return {
    official_book_number: bookNumber || null,
    book_image_path: bookFile.path,
    book_image_filename: bookFile.filename,
  };
}
