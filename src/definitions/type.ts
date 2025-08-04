import { MarkerType } from './enum';

export type XYPosition = {
  x: number;
  y: number;
};

export type TField = {
  id: string;
  name: string;
  type: string;
  isPrimary?: boolean;
  required?: boolean;
  isUnique?: boolean;
  index?: boolean;
  ref?: string;
};

export type EdgeType =
  | 'default'
  | 'straight'
  | 'step'
  | 'smoothstep'
  | 'simplebezier';

export type EdgeMarker = {
  type: MarkerType;
  color?: string;
  width?: number;
  height?: number;
  markerUnits?: string;
  orient?: string;
  strokeWidth?: number;
};

export type TOrm = 'prisma' | 'mongoose';
