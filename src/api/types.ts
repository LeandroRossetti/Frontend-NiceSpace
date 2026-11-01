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

export interface AmenityDto {
  id: number
  nombre: string
  icono: string | null
}

export type WorkspaceType = 'HOT_DESK' | 'PRIVATE_OFFICE' | 'MEETING_ROOM'

export type RentalType = 'HORA' | 'DIA' | 'MES'

export interface LocationDto {
  id: number
  nombre: string
  ownerId: number
  ownerName: string
  address: string | null
  city: string | null
  province: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
  contactEmail: string | null
  contactPhone: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  amenities: AmenityDto[]
}

export interface WorkspaceDto {
  id: number
  nombre: string
  locationId: number
  locationName: string
  city: string | null
  province: string | null
  address: string | null
  floorId: number | null
  workspaceType: WorkspaceType
  capacity: number
  pricePerHour: number | null
  pricePerDay: number | null
  pricePerMonth: number | null
  maxHours: number
  maxDays: number
  maxMonths: number
  currency: string
  isActive: boolean
  createdAt: string
}

export interface FloorDto {
  id: number
  locationId: number
  nombre: string
  levelOrder: number
  mapStructure: string | null
}

export type ReservationStatus = 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'

export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED'

export interface PaymentDto {
  id: number
  reservationId: number
  orderId: string
  paymentId: string | null
  status: PaymentStatus
  amount: number
  currency: string
  checkoutUrl: string
  createdAt: string
  updatedAt: string
}

export interface ConfirmPaymentRequest {
  reservationId: number
  paymentId: string
}

export interface ReservationDto {
  id: number
  workspaceId: number
  workspaceName: string
  workspaceType: string
  locationId: number
  locationName: string
  rentalType: RentalType
  totalPrice: number | null
  currency: string
  startTime: string
  endTime: string
  status: ReservationStatus
  paymentStatus: PaymentStatus | null
  paymentId: string | null
  checkoutUrl: string | null
  createdById: number
  createdByName: string
  teamId: number | null
  teamName: string | null
}

export interface AvailabilityElement {
  workspaceId: number
  nombre: string
  workspaceType: WorkspaceType
  capacity: number
  x: number
  y: number
  w: number
  h: number
  rotation: number
  available: boolean
  pricePerHour: number | null
  pricePerDay: number | null
  pricePerMonth: number | null
  maxHours: number
  maxDays: number
  maxMonths: number
  currency: string
}

export interface AvailabilityResponse {
  locationId: number
  locationName: string
  floorId: number
  floorName: string
  address: string | null
  city: string | null
  province: string | null
  zipCode: string | null
  description: string | null
  contactEmail: string | null
  contactPhone: string | null
  isActive: boolean
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

export interface CreateLocationRequest {
  nombre: string
  address?: string
  city?: string
  province?: string
  zipCode?: string
  latitude?: number | null
  longitude?: number | null
  description?: string
  contactEmail?: string
  contactPhone?: string
  imageUrl?: string
  isActive?: boolean
  amenityIds?: number[]
}

export type UpdateLocationRequest = CreateLocationRequest

export interface CreateWorkspaceRequest {
  nombre: string
  workspaceType: WorkspaceType
  capacity: number
  pricePerHour?: number | null
  pricePerDay?: number | null
  pricePerMonth?: number | null
  maxHours?: number
  maxDays?: number
  maxMonths?: number
  currency?: string
  isActive?: boolean
  floorId?: number | null
}

export type WorkspaceUpdateRequest = CreateWorkspaceRequest

export interface CreateReservationRequest {
  workspaceId: number
  startTime: string
  endTime: string
  rentalType: RentalType
  teamId?: number | null
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
