import type File from '../../types/File';
import type Operation from '../../types/Operation';
import type User from '../../types/User';
import type Module from '../../types/Module';
import Pointer from '../../components/Pointer';
import PointerField from '../../types/PointerField';
import Update from '../../types/Update';

export interface DataManager {
  login(email: string, password: string): Promise<any>;

  // Folder & File
  getRootFolder(operationToken: string): Promise<any[]>;
  getFolder(operationToken: string, folderId: string | null): Promise<any>;
  downloadFile(operationToken: string, fileId: string): Promise<any>;
  uploadFile(data: FormData): Promise<any>;
  uploadGeneralFile(data: FormData): Promise<any>;
  createDirectory(operationToken: string, data: any): Promise<any>;
  deleteFile(operationToken: string, file: File): Promise<any>;
  deleteGeneralFile(operationToken: string, file: File): Promise<any>;
  deleteFolder(operationToken: string, folder: File): Promise<any>;
  renameFile(operationToken: string, file: File, newName: string): Promise<any>;
  editFileAccess(
    operationToken: string,
    file: File,
    users: string[]
  ): Promise<any>;

  // Users
  createUser(data: any): Promise<any>;
  getUsers(): Promise<any[]>;
  getClients(): Promise<any[]>;
  getUsersByOperationToken(operationToken: string): Promise<any[]>;
  updateUser(user: User, data: any): Promise<any>;
  deleteUser(user: User): Promise<any>;

  // Modules
  createModule(data: any): Promise<any>;
  getModules(): Promise<any[]>;
  updateModule(module: Module, data: any): Promise<any>;
  deleteModule(module: Module): Promise<any>;

  // Updates
  createUpdate(data: any): Promise<any>;
  getUpdates(): Promise<any[]>;
  getUpdate(id: string): Promise<any>;
  updateUpdate(update: Update, data: any): Promise<any>;
  deleteUpdate(update: Update): Promise<any>;

  // Notifications
  createNotification(data: any, operationToken: string): Promise<any>;
  getNotifications(): Promise<any[]>;

  // Fields
  createField(data: any, operation_token?: string | null): Promise<any>;
  getFields(operation_token?: string | null): Promise<any[]>;
  updateField(module: PointerField, data: any): Promise<any>;
  deleteField(module: PointerField): Promise<any>;
  createFieldValue(operationToken: string, data: any): Promise<any>;

  // ClockIns
  createClockInEmployee(operationToken: string, identifierValue: string, data: any): Promise<any>;
  getClockInEmployeeByIdentifier(operationToken: string, identifierValue: string): Promise<any>;
  makeClockIn(operationToken: string, clockInEmployeeID: string, fieldValues: any): Promise<any>;
  getClockIns(): Promise<any[]>;

  // Operation
  createOperation(data: any): Promise<any>;
  getOperations(): Promise<any[]>;
  getOperation(operationToken: string): Promise<any>;
  renameOperation(operation: Operation, newName: string): Promise<any>;
  updateOperation(operationToken: string, data: any): Promise<any>;
  deleteOperation(operation: Operation): Promise<any>;

  // Address
  createAddress(data: any): Promise<any>;
}
