export enum Type {
  FILE = 'File',
  FOLDER = 'Folder',
}

type File = {
  '@id': string;
  '@type': Type;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default File;
