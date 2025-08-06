// types.ts - Add these to your existing types file

export interface MissionaryHours {
  id: string;
  missionary_id: string;
  period_start_date: string; // YYYY-MM-DD format
  entry_method: "weekly" | "monthly";
  total_hours: number;
  location?: string;
  activities?: {
    [activity: string]: number; // activity name -> hours spent
  };
  created_at: string;
  missionaries?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface HoursStats {
  total: number;
  activeMissionaries: number;
  averagePerMissionary: number;
  thisWeek: number;
  thisMonth: number;
  lastWeek: number;
  lastMonth: number;
  weeklyEntries: number;
  monthlyEntries: number;
}

export interface CreateHoursRequest {
  missionary_id: string;
  period_start_date: string;
  entry_method: "weekly" | "monthly";
  total_hours: number;
  location?: string;
  activities?: { [activity: string]: number };
}

export interface UpdateHoursRequest {
  total_hours?: number;
  location?: string;
  activities?: { [activity: string]: number };
}
