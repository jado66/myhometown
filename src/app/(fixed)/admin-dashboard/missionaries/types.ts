export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
}

export interface Community {
  id: string;
  name: string;
  city_id: string;
  state: string;
  country: string;
}

export interface Missionary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  assignment_status: "active" | "inactive" | "pending";
  assignment_level?: AssignmentLevel;
  city_id?: string;
  community_id?: string;
  group?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  hours?: HoursRecord[];
}

export interface HoursRecord {
  id: string;
  missionary_id: string;
  date: string;
  hours: number;
  description?: string;
  approved: boolean;
  created_at: string;
}

export type AssignmentLevel = "state" | "city" | "community";

export interface Position {
  group: string;
  title: string;
}
