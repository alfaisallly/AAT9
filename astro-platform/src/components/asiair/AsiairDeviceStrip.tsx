"use client";

import {
  Aperture,
  Camera,
  Crosshair,
  Disc,
  Smartphone,
  Telescope,
} from "lucide-react";
import AsiairDeviceCard from "./AsiairDeviceCard";
import { DeviceStripItem } from "@/lib/types";

const iconForKind = (kind: string) => {
  switch (kind) {
    case "mount":
      return <Disc size={28} />;
    case "camera":
      return <Camera size={28} />;
    case "telescope":
      return <Telescope size={28} />;
    case "filter_wheel":
      return <Aperture size={28} />;
    case "guider":
      return <Crosshair size={28} />;
    case "controller":
      return <Smartphone size={28} />;
    default:
      return <Disc size={28} />;
  }
};

interface Props {
  items: DeviceStripItem[];
  loading?: boolean;
}

export default function AsiairDeviceStrip({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="device-card min-w-[100px] flex-1 animate-pulse bg-[var(--card-elevated)]"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        لا توجد أجهزة — اضبط الـ Rig من صفحة Equipment
      </p>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => (
        <AsiairDeviceCard
          key={item.id}
          name={item.name}
          type={item.type}
          status={item.status}
          detail={item.detail}
          icon={iconForKind(item.kind)}
        />
      ))}
    </div>
  );
}
