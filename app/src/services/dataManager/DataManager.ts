import type File from '../../types/File';
import type Operation from '../../types/Operation';
import type User from '../../types/User';
import type Module from '../../types/Module';
import Pointer from '../../components/Pointer';
import PointerField from '../../types/PointerField';

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
  getClients(): Promise<any[]>;
  getUsersByOperationToken(operationToken: string): Promise<any[]>;

  createModule(data: any): Promise<any>;
  getModules(): Promise<any[]>;
  updateModule(module: Module, data: any): Promise<any>;
  deleteModule(module: Module): Promise<any>;
  
  createPointerField(data: any): Promise<any>;
  getPointerFields(): Promise<any[]>;
  updatePointerField(module: PointerField, data: any): Promise<any>;
  deletePointerField(module: PointerField): Promise<any>;

  updateUser(user: User, data: any): Promise<any>;
  deleteUser(user: User): Promise<any>;
  createOperation(name: string): Promise<any>;
  getOperations(): Promise<any[]>;
  getOperation(operationToken: string): Promise<any>;
  renameOperation(operation: Operation, newName: string): Promise<any>;
  updateOperation(operation: Operation, data: any): Promise<any>;
  deleteOperation(operation: Operation): Promise<any>;
  getPersonPointerByEmail(operationToken: string, email: string): Promise<any>;
  createPersonPointer(operationToken: string, email: string, firstname: string, lastname: string, societe: string) : Promise<any>;
  makePointer(operationToken: string, email: string): Promise<any[]>;
  getPointers(): Promise<any[]>;
}
