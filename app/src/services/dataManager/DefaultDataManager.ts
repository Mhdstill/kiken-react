import { AxiosInstance } from 'axios';

import { DataManager } from './DataManager';
import { Type as FileType } from '../../types/File';
import type File from '../../types/File';
import type User from '../../types/User';
import type Operation from '../../types/Operation';
import { Role } from '../auth/auth';

export class DefaultDataManager implements DataManager {
  private readonly axios: AxiosInstance;

  constructor(axios: AxiosInstance) {
    this.axios = axios;
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response: any = await this.axios.post('/authentication_token', {
        email,
        password,
      });
      return {
        token: response.data.token,
        refreshToken: response.data.refresh_token,
        role: response.data.role,
        operationToken: response.data.operation,
      };
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async getRootFolder(operationToken: string): Promise<any[]> {
    try {
      const response: any = await this.axios.get(
        `/api/${operationToken}/folders`,
        {
          params: { root: true },
        }
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async getFolder(operationToken: string, folderId: string): Promise<any> {
    try {
      const response: any = await this.axios.get(
        `/api/${operationToken}/folders/${folderId}`
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async downloadFile(operationToken: string, fileId: string): Promise<any> {
    try {
      const response = await this.axios.get(
        `/api/${operationToken}/download/${fileId}`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async uploadFile(data: FormData): Promise<any> {
    try {
      await this.axios.post('/api/media_objects', data);
      return true;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async createDirectory(operationToken: string, data: any): Promise<boolean> {
    try {
      const { name, parent } = data;
      await this.axios.post('/api/folders', {
        name,
        operation: `/api/operations/${operationToken}`,
        parent,
      });
      return true;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async deleteFile(operationToken: string, file: File): Promise<File> {
    try {
      await this.axios.delete(
        `/api/${operationToken}/media_objects/${file.id}`
      );
      return file;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async deleteFolder(operationToken: string, folder: File): Promise<File> {
    try {
      await this.axios.delete(`/api/${operationToken}/folders/${folder.id}`);
      return folder;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async renameFile(
    operationToken: string,
    file: File,
    newName: string
  ): Promise<boolean> {
    try {
      if (FileType.FOLDER === file['@type']) {
        await this.axios.put(`/api/${operationToken}/folders/${file.id}`, {
          name: newName,
        });
      } else {
        await this.axios.put(
          `/api/${operationToken}/media_objects/${file.id}`,
          {
            name: newName,
          }
        );
      }
      return true;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async editFileAccess(
    operationToken: string,
    file: File,
    users: string[]
  ): Promise<boolean> {
    try {
      if (FileType.FOLDER === file['@type']) {
        await this.axios.put(`/api/${operationToken}/folders/${file.id}`, {
          users,
        });
      } else {
        await this.axios.put(
          `/api/${operationToken}/media_objects/${file.id}`,
          {
            users,
          }
        );
      }
      return true;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async createUser(data: any): Promise<boolean> {
    try {
      const { email, password, operation } = data;
      let body: any = {
        email,
        password,
      };
      const { role: userRole } = sessionStorage;
      let req;
      if (userRole === Role.ADMIN) {
        body = { ...body, operation, roles: [Role.CLIENT] };
        req = await this.axios.post('/api/users', body);
      } else {
        req = await this.axios.post(`/api/${operation}/users`, body);
      }
      return true;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const { operation_token, role } = sessionStorage;
      if (operation_token && role === Role.CLIENT) {
        return this.getUsersByOperationToken(operation_token);
      } else {
        const response: any = await this.axios.get('/api/users');
        return response.data['hydra:member'];
      }
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async getUsersByOperationToken(operationToken: string): Promise<User[]> {
    try {
      const response: any = await this.axios.get(
        `/api/${operationToken}/users`
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async updateUser(user: User, data: any): Promise<boolean> {
    try {
      const { email, password } = data;
      const { operation_token, role } = sessionStorage;
      const body = {
        email,
        password,
      };
      if (operation_token && role === Role.CLIENT) {
        await this.axios.put(`/api/${operation_token}/users/${user.id}`, body);
      } else {
        await this.axios.put(`/api/users/${user.id}`, body);
      }
      return true;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async deleteUser(user: User): Promise<User> {
    try {
      const { operation_token, role } = sessionStorage;
      if (operation_token && role === Role.CLIENT) {
        await this.axios.delete(`/api/${operation_token}/users/${user.id}`);
      } else {
        await this.axios.delete(`/api/users/${user.id}`);
      }
      return user;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async createOperation(name: string): Promise<boolean> {
    try {
      await this.axios.post('/api/operations', { name });
      return true;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async getOperations(): Promise<Operation[]> {
    try {
      const response: any = await this.axios.get('/api/operations');
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async renameOperation(
    operation: Operation,
    newName: string
  ): Promise<boolean> {
    try {
      await this.axios.put(`/api/operations/${operation.id}`, {
        name: newName,
      });
      return true;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }

  async deleteOperation(operation: Operation): Promise<Operation> {
    try {
      await this.axios.delete(`/api/operations/${operation.id}`);
      return operation;
    } catch (err) {
      throw new Error(err.response.statusText);
    }
  }
}
