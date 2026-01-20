export type UserRole = 'admin' | 'manager' | 'employee'

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  qr_code: string
  created_at: string
  updated_at: string
}

export interface DeviceSession {
  id: string
  user_id: string
  device_info: string
  opened_at: string
  closed_at: string | null
  duration_minutes: number | null
  created_at: string
}

export interface Attendance {
  id: string
  user_id: string
  check_in: string
  check_out: string | null
  qr_code_used: string
  location?: string
  created_at: string
}

export interface WorkLog {
  id: string
  user_id: string
  date: string
  description: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  project_tag?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  platform: 'slack' | 'teams' | 'whatsapp'
  message_id: string
  channel_id: string
  sender_id: string
  sender_name: string
  content: string
  received_at: string
  created_at: string
}

export interface MessageResponse {
  id: string
  message_id: string
  user_id: string
  responded_at: string
  response_time_seconds: number
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_by?: string
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface KPIMetric {
  id: string
  user_id: string
  month: number
  year: number
  work_hours_total: number
  work_hours_target: number
  avg_response_time_seconds: number
  response_time_target_seconds: number
  task_completion_rate: number
  task_completion_target: number
  productivity_score: number
  productivity_target: number
  created_at: string
  updated_at: string
}

export interface KPIEvaluation {
  id: string
  user_id: string
  kpi_metric_id: string
  month: number
  year: number
  evaluated_by: string
  overall_score: number
  comments: string
  created_at: string
}

