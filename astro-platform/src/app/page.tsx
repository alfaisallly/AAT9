"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Crosshair,
  ImageIcon,
  Moon,
  Settings2,
  Telescope,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { DashboardStats, Session, AstroImage } from "@/lib/types";
import { fetchJson } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [recentImages, setRecentImages] = useState<AstroImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchJson<DashboardStats>("/api/dashboard"),
      fetchJson<Session[]>("/api/sessions"),
      fetchJson<AstroImage[]>("/api/images"),
    ])
      .then(([statsData, sessionsData, imagesData]) => {
        setStats(statsData);
        setSessions(sessionsData.slice(0, 3));
        setRecentImages(imagesData.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--muted)]">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على معداتك وجلساتك وصورك الفلكية"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="الحوامل"
          value={stats?.mounts ?? 0}
          icon={Settings2}
          color="text-blue-400"
        />
        <StatCard
          title="الكاميرات"
          value={stats?.cameras ?? 0}
          icon={Camera}
          color="text-purple-400"
        />
        <StatCard
          title="التلسكopes"
          value={stats?.telescopes ?? 0}
          icon={Telescope}
          color="text-cyan-400"
        />
        <StatCard
          title="الأهداف"
          value={stats?.targets ?? 0}
          icon={Crosshair}
          color="text-amber-400"
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="جلسات المراقبة"
          value={stats?.sessions ?? 0}
          icon={Moon}
          color="text-indigo-400"
        />
        <StatCard
          title="إجمالي الصور"
          value={stats?.images ?? 0}
          icon={ImageIcon}
          color="text-green-400"
        />
        <StatCard
          title="إطارات Light"
          value={stats?.lightFrames ?? 0}
          icon={ImageIcon}
          color="text-emerald-400"
        />
        <StatCard
          title="إطارات المعايرة"
          value={stats?.calibrationFrames ?? 0}
          icon={ImageIcon}
          color="text-orange-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">آخر جلسات المراقبة</h2>
            <Link
              href="/sessions"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              عرض الكل
            </Link>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">لا توجد جلسات بعد</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-[var(--card-border)] bg-[#0b1020] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{session.name}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {session.session_date}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    {session.mount_name && <span>🔄 {session.mount_name}</span>}
                    {session.camera_name && (
                      <span>📷 {session.camera_name}</span>
                    )}
                    {session.image_count !== undefined && (
                      <span>🖼 {session.image_count} صورة</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">آخر الصور</h2>
            <Link
              href="/images"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              عرض الكل
            </Link>
          </div>
          {recentImages.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">لا توجد صور بعد</p>
          ) : (
            <div className="space-y-2">
              {recentImages.map((img) => (
                <div
                  key={img.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[#0b1020] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {img.filename}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {img.target_name || img.session_name} • {img.exposure_sec}
                      s
                    </p>
                  </div>
                  <span
                    className={`badge ${
                      img.processed
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {img.processed ? "معالج" : "خام"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/equipment" className="card transition hover:border-indigo-500/50">
          <Settings2 className="mb-2 text-indigo-400" size={24} />
          <h3 className="font-semibold text-white">إدارة المعدات</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            أضف وعدّل حواملك وكاميراتك وتلسكopes
          </p>
        </Link>
        <Link href="/sessions" className="card transition hover:border-indigo-500/50">
          <Moon className="mb-2 text-indigo-400" size={24} />
          <h3 className="font-semibold text-white">جلسة جديدة</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            سجّل ليلة مراقبة جديدة واربط المعدات
          </p>
        </Link>
        <Link href="/images" className="card transition hover:border-indigo-500/50">
          <ImageIcon className="mb-2 text-indigo-400" size={24} />
          <h3 className="font-semibold text-white">إضافة صور</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            سجّل إطارات Light و Dark و Flat
          </p>
        </Link>
      </div>
    </div>
  );
}
