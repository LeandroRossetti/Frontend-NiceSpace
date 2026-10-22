import type { SpaceResourceDto } from '../api/types'

export const GRID_SIZE = 50

export interface EditorResource extends SpaceResourceDto {
  kind: 'resource'
  elementId: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
}

export type StaticElementKind = 'wall' | 'door' | 'common-area'

export interface StaticFloorElement {
  kind: StaticElementKind
  elementId: string
  label: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
}

export type EditorElement = EditorResource | StaticFloorElement

export interface ResourceDraft {
  nombre: string
  capacidad: string
  hourlyPrice: string
  dailyPrice: string
  monthlyPrice: string
  currency: string
  width: string
  height: string
  rotation: string
}

export interface CanvasViewport {
  x: number
  y: number
  scale: number
}
