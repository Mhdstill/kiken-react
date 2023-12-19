import { AxiosInstance } from 'axios';

import { DataManager } from './DataManager';
import { Type as FileType } from '../../types/File';
import type File from '../../types/File';
import type User from '../../types/User';
import type Module from '../../types/Module';
import type Pointer from '../../types/Pointer';
import type Operation from '../../types/Operation';
import { Role } from '../auth/auth';
import PointerField from '../../types/PointerField';

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
        modules: response.data.modules
      };
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getFolder(operationToken: string, folderId: string): Promise<any> {
    try {
      const response: any = await this.axios.get(
        `/api/${operationToken}/folders/${folderId}`
      );
      return response.data;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async uploadFile(data: FormData): Promise<any> {
    try {
      const response = await this.axios.post('/api/media_objects', data);
      return response.data;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteFile(operationToken: string, file: File): Promise<File> {
    try {
      await this.axios.delete(
        `/api/${operationToken}/media_objects/${file.id}`
      );
      return file;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteFolder(operationToken: string, folder: File): Promise<File> {
    try {
      await this.axios.delete(`/api/${operationToken}/folders/${folder.id}`);
      return folder;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
        let operationIRI = `/api/operations/${operation}`
        body = { ...body, operation: operationIRI };
        req = await this.axios.post('/api/users/client', body);
        //req = await this.axios.post(`/api/${operation}/users`, body);
      }
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getClients(): Promise<User[]> {
    try {
      const { operation_token, role } = sessionStorage;

      if (!operation_token || role !== Role.ADMIN) {
        return [];
      }

      const response: any = await this.axios.get('/api/users');
      let datas = response.data['hydra:member'];

      return datas.filter((user: any) => user.roles.includes("ROLE_ADMIN_CLIENT"));

    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getUsersByOperationToken(operationToken: string): Promise<User[]> {
    try {
      const response: any = await this.axios.get(
        `/api/${operationToken}/users`
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }



  /** MODULES */
  async getModules(): Promise<Module[]> {
    try {
      const response: any = await this.axios.get(
        `/api/modules`
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createModule(data: any): Promise<boolean> {
    try {
      const { name, code } = data;
      let body: any = {
        name,
        code,
      };
      let req;
      req = await this.axios.post('/api/modules', body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async updateModule(module: Module, data: any): Promise<boolean> {
    try {
      const { name, code } = data;
      const body = {
        name,
        code,
      };
      await this.axios.put(`/api/modules/${module.id}`, body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteModule(module: Module): Promise<Module> {
    try {
      await this.axios.delete(`/api/modules/${module.id}`);
      return module;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }



/** Pointer Fields */
  async getPointerFields(): Promise<PointerField[]> {
    try {
      const { operation_token } = sessionStorage;
      const response: any = await this.axios.get(
        `/api/${operation_token}/fields`
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createPointerField(data: any): Promise<boolean> {
    try {
      const { operation_token } = sessionStorage;
      const { label, type } = data;
      let body: any = {
        label,
        type,
      };

      let operationIRI = `/api/operations/${operation_token}`
      body = { ...body, operation: operationIRI };
      
      let req;
      req = await this.axios.post('/api/fields', body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async updatePointerField(field: PointerField, data: any): Promise<boolean> {
    try {
      const { label, type } = data;
      const body = {
        label,
        type,
      };
      await this.axios.put(`/api/fields/${field.id}`, body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deletePointerField(field: PointerField): Promise<PointerField> {
    try {
      await this.axios.delete(`/api/fields/${field.id}`);
      return field;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createOperation(name: string): Promise<boolean> {
    try {
      await this.axios.post('/api/operations', { name });
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async updateOperation(operation: Operation, data: any): Promise<boolean> {
    try {
      const { name, modules } = data;
      const body = {
        name,
        modules,
      };
      await this.axios.put(`/api/operations/${operation.id}`, body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getOperation(operationToken: string): Promise<Operation> {
    try {
      const response: any = await this.axios.get(`/api/operations/${operationToken}`);
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getOperations(): Promise<Operation[]> {
    try {
      const response: any = await this.axios.get('/api/operations');
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
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
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteOperation(operation: Operation): Promise<Operation> {
    try {
      await this.axios.delete(`/api/operations/${operation.id}`);
      return operation;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getPersonPointerByEmail(operationToken: string, email: string): Promise<any> {
    try {
      const response: any = await this.axios.get(
        `/api/${operationToken}/person_pointers/get_by_email`,
        {
          params: {
            email: email,
          },
        }
      );
      return response.data;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createPersonPointer(operationToken: string, email: string, firstname: string, lastname: string, societe: string): Promise<boolean> {
    try {
      let personPointer = await this.getPersonPointerByEmail(operationToken, email);
      if (personPointer !== null && personPointer !== undefined) {
        throw new Error('Email déjà existant');
      }

      await this.axios.post('/api/person_pointers', {
        operation: `/api/operations/${operationToken}`,
        email: email,
        firstname: firstname,
        lastname: lastname,
        societe: societe
      });

      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async makePointer(operationToken: string, email: string): Promise<any> {
    try {
      let personPointer = await this.getPersonPointerByEmail(operationToken, email);
      if (personPointer === null || personPointer === undefined) {
        throw new Error('Email Not found');
      }
      await this.axios.post('/api/pointers', {
        operation: operationToken,
        person: personPointer['id']
      });
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getPointers(): Promise<Pointer[]> {
    try {
      const { operation_token } = sessionStorage;
      const response: any = await this.axios.get(
        `/api/${operation_token}/pointers`
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }
}
