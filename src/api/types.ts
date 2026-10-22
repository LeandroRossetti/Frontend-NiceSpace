export type AccountType = 'OWNER' | 'TENANT'

export interface UserDto {
  id: number
  email: string
  nombre: string
  accountType: AccountType
}

export interface AuthResponse {
  token: string
  user: UserDto
}

export interface WorkspaceDto {
  id: number
  nombre: string
  ownerId: number
  ownerName: string
  mapStructure: string | null
  createdAt: string
}

export interface SpaceResourceDto {
  id: number
  workspaceId: number
  floorId: number
  nombre: string
  capacidad: number
  tipo: 'DESK' | 'ROOM'
  active: boolean
  hourlyPrice: number | null
  dailyPrice: number | null
  monthlyPrice: number | null
  currency: string
}

export interface FloorDto {
  id: number
  workspaceId: number
  nombre: string
  levelOrder: number
  mapStructure: string | null
}

export type ReservationStatus = 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'

export interface ReservationDto {
  id: number
  resourceId: number
  resourceName: string
  resourceType: string
  workspaceId: number
  workspaceName: string
  startTime: string
  endTime: string
  status: ReservationStatus
  createdById: number
  createdByName: string
  teamId: number | null
  teamName: string | null
}

export interface AvailabilityElement {
  resourceId: number
  nombre: string
  capacidad: number
  tipo: 'DESK' | 'ROOM'
  x: number
  y: number
  w: number
  h: number
  rotation: number
  available: boolean
  hourlyPrice: number | null
  dailyPrice: number | null
  monthlyPrice: number | null
  currency: string
}

export interface AvailabilityResponse {
  workspaceId: number
  workspaceName: string
  floorId: number
  floorName: string
  elements: AvailabilityElement[]
  objects: StaticMapObject[]
}

export interface StaticMapObject {
  elementId: string
  kind: 'wall' | 'door' | 'common-area'
  label: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
}

export interface TeamDto {
  id: number
  nombre: string
  ownerId: number
  ownerName: string
  myRole: 'OWNER' | 'MEMBER'
}

export interface TeamMemberDto {
  userId: number
  nombre: string
  email: string
  status: string
}

export interface TeamInvitationDto {
  id: number
  teamId: number
  teamName: string
  email: string
  token: string
  status: string
  createdAt: string
}
