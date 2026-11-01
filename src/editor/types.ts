import type { WorkspaceDto } from '../api/types'

export const GRID_SIZE = 50

export interface EditorWorkspace extends WorkspaceDto {
  kind: 'workspace'
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

export type EditorElement = EditorWorkspace | StaticFloorElement

export interface StaticElementDraft {
  nombre: string
  width: string
  height: string
  rotation: string
}

export interface CanvasViewport {
  x: number
  y: number
  scale: number
}
