import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faImage, faFile, faFilePdf, faFileWord, faEnvelope } from '@fortawesome/free-solid-svg-icons';

export enum Type {
  FILE = 'MediaObject',
  FOLDER = 'Folder',
};

type File = {
  '@id': string;
  '@type': Type;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export interface FileType extends File {
  key: React.Key;
  path: string;
  type: string;
  size?: number;
  extension?: string;
};

export const getGeneralSize = (size: number) => {
  if (!size) {
    return "0 Ko";
  }

  const KILOBYTE = 1000;
  const MEGABYTE = 1000000;
  const GIGABYTE = 1000000000;

  if (size >= GIGABYTE) {
    return (size / GIGABYTE).toFixed(1) + " Go";
  } else if (size >= MEGABYTE) {
    return (size / MEGABYTE).toFixed(1) + " Mo";
  } else {
    return (size / KILOBYTE).toFixed(1) + " Ko";
  }
}

export const getSize = (record: any) => {
  if (record['@type'] === Type.FOLDER) {
    return "-";
  }

  const size = record.size;
  return getGeneralSize(size);
};

export default File;
