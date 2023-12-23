import FieldValue from "./FieldValue";
import Operation from "./Operation";

export enum FieldType {
  TEXT = 1,
  PASSWORD = 2,
  EMAIL = 3,
  NUMBER = 4,
  DATE = 5,
  DATETIME = 6,
  CHECKBOX = 7,
  RADIO = 8,
  RANGE = 9,
  TEL = 10,
  URL = 11,
  TEXTAREA = 12,
}

export const FieldTypeStringMapping: Record<FieldType, string> = {
  [FieldType.TEXT]: "Texte",
  [FieldType.PASSWORD]: "Mot de passe",
  [FieldType.EMAIL]: "Email",
  [FieldType.NUMBER]: "Nombre",
  [FieldType.DATE]: "Date",
  [FieldType.DATETIME]: "Date avec heure",
  [FieldType.CHECKBOX]: "Case à cocher",
  [FieldType.RADIO]: "Bouton radio",
  [FieldType.RANGE]: "Plage",
  [FieldType.TEL]: "Téléphone",
  [FieldType.URL]: "URL",
  [FieldType.TEXTAREA]: "Zone de texte"
};

export const FieldTypeMapping: Record<FieldType, string> = {
  [FieldType.TEXT]: "text",
  [FieldType.PASSWORD]: "password",
  [FieldType.EMAIL]: "email",
  [FieldType.NUMBER]: "number",
  [FieldType.DATE]: "date",
  [FieldType.DATETIME]: "datetime",
  [FieldType.CHECKBOX]: "checkbox",
  [FieldType.RADIO]: "radio",
  [FieldType.RANGE]: "range",
  [FieldType.TEL]: "phone",
  [FieldType.URL]: "url",
  [FieldType.TEXTAREA]: "textarea"
};

// Définition du type PointerField
export type PointerField = {
  '@id': string;
  id: string;
  label: string;
  type: FieldType;
  isUnique: boolean;
  allwaysFill: boolean;
  isRequired: boolean;
  fieldValues: FieldValue[];
  operation: Operation;
};

export function getTypeString(type: FieldType): string {
  return FieldTypeStringMapping[type];
}

export function getType(type: FieldType): string {
  return FieldTypeMapping[type];
}

export default PointerField;