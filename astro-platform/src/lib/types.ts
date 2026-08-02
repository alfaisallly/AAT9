export type MountType = "equatorial" | "altaz" | "hybrid";
export type FrameType = "light" | "dark" | "flat" | "bias" | "other";
export type TargetType =
  | "galaxy"
  | "nebula"
  | "cluster"
  | "planet"
  | "moon"
  | "sun"
  | "comet"
  | "other";

export interface Mount {
  id: number;
  name: string;
  brand: string;
  model: string;
  mount_type: MountType;
  max_payload_kg: number | null;
  notes: string | null;
  created_at: string;
}

export interface Camera {
  id: number;
  name: string;
  brand: string;
  model: string;
  sensor_type: string;
  pixel_size_um: number | null;
  resolution: string | null;
  has_cooling: number;
  notes: string | null;
  created_at: string;
}

export interface Telescope {
  id: number;
  name: string;
  brand: string;
  model: string;
  focal_length_mm: number | null;
  aperture_mm: number | null;
  telescope_type: string;
  notes: string | null;
  created_at: string;
}

export interface Filter {
  id: number;
  name: string;
  filter_type: string;
  bandwidth_nm: number | null;
  notes: string | null;
}

export interface Target {
  id: number;
  name: string;
  designation: string | null;
  target_type: TargetType;
  ra: string | null;
  dec: string | null;
  constellation: string | null;
  notes: string | null;
}

export interface Session {
  id: number;
  name: string;
  session_date: string;
  location: string | null;
  mount_id: number | null;
  camera_id: number | null;
  telescope_id: number | null;
  weather: string | null;
  seeing: string | null;
  notes: string | null;
  created_at: string;
  mount_name?: string | null;
  camera_name?: string | null;
  telescope_name?: string | null;
  image_count?: number;
}

export interface AstroImage {
  id: number;
  session_id: number;
  target_id: number | null;
  filter_id: number | null;
  frame_type: FrameType;
  filename: string;
  file_path: string | null;
  exposure_sec: number | null;
  gain: number | null;
  offset: number | null;
  temperature_c: number | null;
  date_taken: string | null;
  processed: number;
  notes: string | null;
  created_at: string;
  target_name?: string | null;
  filter_name?: string | null;
  session_name?: string | null;
}

export interface DashboardStats {
  mounts: number;
  cameras: number;
  telescopes: number;
  sessions: number;
  images: number;
  lightFrames: number;
  calibrationFrames: number;
  targets: number;
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "offline";

export interface Controller {
  id: number;
  name: string;
  brand: string;
  model: string;
  ip_address: string | null;
  wifi_ssid: string | null;
  connection_status: ConnectionStatus;
  battery_pct: number;
  battery_voltage: number;
  is_charging: number;
  last_sync_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface FilterWheel {
  id: number;
  name: string;
  brand: string;
  model: string;
  slots: number;
  current_slot: number;
  current_filter: string | null;
  connection_status: ConnectionStatus;
  controller_id: number | null;
  notes: string | null;
  created_at: string;
}

export interface CustomEquipment {
  id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  specs_json: string | null;
  connection_status: ConnectionStatus;
  notes: string | null;
  created_at: string;
}

export interface ActiveRig {
  id: number;
  name: string;
  mount_id: number | null;
  camera_id: number | null;
  telescope_id: number | null;
  guider_id: number | null;
  filter_wheel_id: number | null;
  controller_id: number | null;
  asiair_profile: string | null;
  updated_at: string;
  mount_name?: string | null;
  camera_name?: string | null;
  telescope_name?: string | null;
  guider_name?: string | null;
  filter_wheel_name?: string | null;
  controller_name?: string | null;
}

export interface DeviceStripItem {
  id: string;
  kind: string;
  name: string;
  type: string;
  status: "online" | "offline" | "idle";
  detail?: string;
}

export interface BatteryState {
  voltage: number;
  percent: number;
  isCharging: boolean;
  status: "full" | "good" | "low" | "critical";
  controllerId: number | null;
  controllerName: string | null;
  lastSyncAt: string | null;
}

export interface DeviceStatusPayload {
  connected: boolean;
  rig: ActiveRig | null;
  controller: Controller | null;
  battery: BatteryState;
  strip: DeviceStripItem[];
  cameraTempC: number | null;
  mountState: string;
  guideRms: string | null;
}
