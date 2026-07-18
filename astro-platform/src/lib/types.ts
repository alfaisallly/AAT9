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
