export enum FieldType {
  TEXT = 1,
  PASSWORD = 2,
  EMAIL = 3,
  NUMBER = 4,
  DATE = 5,
  CHECKBOX = 6,
  RADIO = 7,
  RANGE = 8,
  TEL = 9,
  URL = 10,
  TEXTAREA = 11
}

export const FieldTypeMapping: Record<FieldType, string> = {
  [FieldType.TEXT]: "Texte",
  [FieldType.PASSWORD]: "Mot de passe",
  [FieldType.EMAIL]: "Email",
  [FieldType.NUMBER]: "Nombre",
  [FieldType.DATE]: "Date",
  [FieldType.CHECKBOX]: "Case à cocher",
  [FieldType.RADIO]: "Bouton radio",
  [FieldType.RANGE]: "Plage",
  [FieldType.TEL]: "Téléphone",
  [FieldType.URL]: "URL",
  [FieldType.TEXTAREA]: "Zone de texte"
};

// Définition du type PointerField
export type PointerField = {
  '@id': string;
  id: string;
  label: string;
  type: FieldType; // Utilisation de l'énumération FieldType ici
};

// Fonction pour obtenir la chaîne correspondante
export function getTypeString(type: FieldType): string {
  return FieldTypeMapping[type];
}
export function getFieldTypeFromLabel(label: string): FieldType | undefined {
  const entry = Object.entries(FieldTypeMapping).find(([key, value]) => value === label);
  const fieldType = entry ? Number(entry[0]) as FieldType : undefined;
  return fieldType;
}


export default PointerField;