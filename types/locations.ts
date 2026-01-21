export interface Location {
  id: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  radius_meters: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

