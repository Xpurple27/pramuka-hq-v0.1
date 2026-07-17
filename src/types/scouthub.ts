export type Gudep = {
  id: string
  name: string
  school_name: string
  gudep_number: string | null
  address: string | null
  level: string
  academic_year: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type Member = {
  id: string
  gudep_id: string
  name: string
  student_number: string | null
  nisn: string | null
  gender: 'L' | 'P'
  class_name: string
  scout_level: string
  patrol_id: string | null
  parent_phone: string | null
  status: 'Aktif' | 'Cuti' | 'Alumni'
  notes: string | null
  joined_at: string
  created_at: string
  updated_at: string
}

export type Patrol = {
  id: string
  gudep_id: string
  name: string
  patrol_type: string
  leader_member_id: string | null
  vice_leader_member_id: string | null
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TrainingSession = {
  id: string
  gudep_id: string
  title: string
  training_date: string
  start_time: string
  end_time: string | null
  location: string
  material: string | null
  objective: string | null
  description: string | null
  evaluation_notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'

export type Attendance = {
  id: string
  training_session_id: string
  member_id: string
  status: AttendanceStatus
  note: string | null
  created_at: string
  updated_at: string
}

export type SkuStatus = 'Belum' | 'Proses' | 'Lulus'

export type SkuItem = {
  id: number
  level: string
  category: string
  item_number: number
  title: string
  description: string
}

export type MemberSkuProgress = {
  id: string
  member_id: string
  sku_item_id: number
  status: SkuStatus
  note: string | null
  validated_by: string | null
  validated_at: string | null
  updated_at: string
}

export type ActionResult = {
  ok: boolean
  message: string
}

export type DashboardContext = {
  userId: string
  email: string
  fullName: string
  gudep: Gudep[]
  activeGudep: Gudep | null
}
