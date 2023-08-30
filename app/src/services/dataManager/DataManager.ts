import type File from '../../types/File';
import type Operation from '../../types/Operation';
import type User from '../../types/User';
import Pointer from '../../components/Pointer';

export interface DataManager {
  login(email: string, password: string): Promise<any>;
  getRootFolder(operationToken: string): Promise<any[]>;
  getFolder(operationToken: string, folderId: string | null): Promise<any>;
  downloadFile(operationToken: string, fileId: string): Promise<any>;
  uploadFile(data: FormData): Promise<any>;
  createDirectory(operationToken: string, data: any): Promise<any>;
  deleteFile(operationToken: string, file: File): Promise<any>;
  deleteFolder(operationToken: string, folder: File): Promise<any>;
  renameFile(operationToken: string, file: File, newName: string): Promise<any>;
  editFileAccess(
    operationToken: string,
    file: File,
    users: string[]
  ): Promise<any>;
  createUser(data: any): Promise<any>;
  getUsers(): Promise<any[]>;
  getUsersByOperationToken(operationToken: string): Promise<any[]>;
  updateUser(user: User, data: any): Promise<any>;
  deleteUser(user: User): Promise<any>;
  createOperation(name: string): Promise<any>;
  getOperations(): Promise<any[]>;
  getOperation(operationToken: string): Promise<any>;
  renameOperation(operation: Operation, newName: string): Promise<any>;
  deleteOperation(operation: Operation): Promise<any>;
  getPersonPointerByEmail(operationToken: string, email: string): Promise<any>;
  createPersonPointer(operationToken: string, email: string, firstname: string, lastname: string) : Promise<any>;
  makePointer(operationToken: string, email: string): Promise<any[]>;
  getPointers(): Promise<any[]>;
}
