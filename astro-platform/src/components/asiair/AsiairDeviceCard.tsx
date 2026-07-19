"use client";

interface DeviceCardProps {
  name: string;
  type: string;
  status?: "online" | "offline" | "idle";
  detail?: string;
  icon: React.ReactNode;
}

export default function AsiairDeviceCard({
  name,
  type,
  status = "online",
  detail,
  icon,
}: DeviceCardProps) {
  const statusColor =
    status === "online"
      ? "status-dot-online"
      : status === "idle"
        ? "bg-[var(--warning)]"
        : "bg-gray-600";

  return (
    <div className="device-card min-w-[100px] flex-1">
      <div className="absolute left-3 top-3">
        <span className={`status-dot ${statusColor}`} />
      </div>
      <div className="mb-2 mt-1 text-[var(--zwo-orange)]">{icon}</div>
      <p className="text-center text-xs font-semibold text-white">{name}</p>
      <p className="text-center text-[10px] text-[var(--muted)]">{type}</p>
      {detail && (
        <p className="mt-1 text-center text-[10px] tabular-nums text-cyan-400">
          {detail}
        </p>
      )}
    </div>
  );
}
