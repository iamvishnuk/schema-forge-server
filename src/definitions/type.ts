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
};
