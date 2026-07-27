#!/bin/bash
set -e

echo "=== تشغيل نظام إدارة أجهزة الاتصالات ==="

# Backend
cd "$(dirname "$0")/backend"
echo "تشغيل الخادم الخلفي على المنفذ 8000..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Frontend
cd "../frontend"
echo "تشغيل الواجهة الأمامية على المنفذ 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "النظام يعمل:"
echo "  الواجهة: http://localhost:5173"
echo "  API:     http://localhost:8000/docs"
echo "  المستخدم: admin / admin123"
echo ""
echo "اضغط Ctrl+C للإيقاف"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
