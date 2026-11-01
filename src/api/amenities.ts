import { api } from './client'
import type { AmenityDto } from './types'

export async function getAmenities(): Promise<AmenityDto[]> {
  const { data } = await api.get<AmenityDto[]>('/amenities')
  return data
}
