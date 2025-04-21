import { CSSProperties, ReactNode } from 'react';
import { InvitationRoleEnum } from '../core/entities/Invitation.entity';
import { UserEntity } from '../core/entities/user.entity';
import { EdgeMarker, EdgeType, TField, XYPosition } from './type';

export interface IInviteTeamMember {
  teamId: string;
  user: UserEntity;
  inviteeEmail: string;
  role: InvitationRoleEnum;
}

export interface IGetUserTeams {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
  createdBy: string;
}

export interface INode {
  id: string;
  type: string;
  position: XYPosition;
  data: {
    label: string;
    description: string;
    fields: TField[];
  };
}

export interface IEdge {
  id: string;
  type?: EdgeType;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  data?: Record<string, unknown>;
  selected?: boolean;
  markerStart?: EdgeMarker;
  markerEnd?: EdgeMarker;
  interactionWidth?: number;
  label?: ReactNode;
  labelStyle?: CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  style?: CSSProperties;
  className?: string;
  reconnectable?: boolean | unknown;
  focusable?: boolean;
}
