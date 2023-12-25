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
  async getFields(operation_token: string | null = null): Promise<PointerField[]> {
    try {
      if (!operation_token) {
        operation_token = sessionStorage.getItem('operation_token');
        if (!operation_token) {
          throw new Error("No operation token provided and none found in sessionStorage.");
        }
      }

      const response: any = await this.axios.get(`/api/${operation_token}/fields`);
      const datas = response.data['hydra:member'];

      datas.sort((a: any, b: any) => {
        if (a.isUnique && !b.isUnique) {
          return -1; // Place a avant b
        }
        if (!a.isUnique && b.isUnique) {
          return 1; // Place b avant a
        }
        return 0; // Conserve l'ordre initial si les deux ont la même valeur pour isUnique
      });


      return datas;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err.message || err.toString());
    }
  }


  async createField(data: any, operation_token: string | null = null): Promise<boolean> {
    try {
      if (!operation_token) {
        operation_token = sessionStorage.getItem('operation_token');
        if (!operation_token) {
          throw new Error("No operation token provided and none found in sessionStorage.");
        }
      }
      const { label, type, isUnique, allwaysFill, isRequired } = data;
      let body: any = {
        label,
        type,
        isUnique,
        allwaysFill,
        isRequired
      };

      body = { ...body, operation: `/api/operations/${operation_token}` };

      let req;
      req = await this.axios.post('/api/fields', body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async updateField(field: PointerField, data: any): Promise<boolean> {
    try {
      const { label, type, allwaysFill, isRequired } = data;
      const body = {
        label,
        type,
        allwaysFill,
        isRequired
      };
      await this.axios.put(`/api/fields/${field.id}`, body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteField(field: PointerField): Promise<PointerField> {
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
      const op = await this.axios.post('/api/operations', { name });
      const opID = op.data['id'];
      this.createField({ "label": "Email", "type": 3, "isUnique": true }, opID)
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async updateOperation(operationToken: string, data: any): Promise<boolean> {
    try {
      const { name, modules, useClockInGeolocation, distance, street, zip, city } = data;

      let addressIRI = null;
      if (street && zip && city) {
        const address = await this.createAddress({ street, zip, city })
        addressIRI = (address) ? address['@id'] : '';
      }

      const body: {
        name: any;
        modules: any;
        useClockInGeolocation: any;
        distance: any;
        address?: string; // Déclare 'address' comme optionnel
      } = {
        name,
        modules,
        useClockInGeolocation,
        distance
      };

      if (addressIRI) {
        body.address = addressIRI;
      }

      await this.axios.put(`/api/operations/${operationToken}`, body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getOperation(operationToken: string): Promise<Operation> {
    try {
      const response: any = await this.axios.get(`/api/operations/${operationToken}`);
      return response.data;
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

  async getClockInEmployeeByIdentifier(operationToken: string, identifierValue: string): Promise<any> {
    try {
      const response: any = await this.axios.get(
        `/api/clock_in_employees/get_by_identifier`,
        {
          params: {
            op: operationToken,
            v: identifierValue,
          },
        }
      );
      return response.data;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }
  async createFieldValue(operationToken: string, data: any): Promise<any> {
    try {
      const { value, customField } = data;
      const body = {
        value,
        customField: `/api/${operationToken}/fields/${customField}`,
      };

      // Utilisation de await pour attendre la réponse de la requête POST
      const response = await this.axios.post('/api/field_values', body);
      return response.data; // Retourne les données de la réponse
    } catch (err) {
      // Gestion des erreurs
      const errorMsg = (err.response && err.response.statusText) ? err.response.statusText : err.toString();
      throw new Error(errorMsg);
    }
  }


  async createClockInEmployee(operationToken: string, identifierValue: string, data: any): Promise<boolean> {
    try {
      let personPointer = await this.getClockInEmployeeByIdentifier(operationToken, identifierValue);
      if (personPointer !== null && personPointer !== undefined) {
        throw new Error('Employé déjà existant');
      }

      const fieldValues = [];
      for (const [cle, valeur] of Object.entries(data)) {
        const fieldValue = await this.createFieldValue(operationToken, { customField: cle, value: valeur });
        fieldValues.push(fieldValue['@id']);
      }

      const response = await this.axios.post('/api/clock_in_employees', {
        operation: `/api/operations/${operationToken}`,
        fieldValues: fieldValues
      });
      return response.data;

    } catch (err) {
      const errorMsg = (err.response && err.response.statusText) ? err.response.statusText : err.toString();
      throw new Error(errorMsg);
    }
  }

  async makeClockIn(operationToken: string, employeeIdentifierValue: string, fieldValues: any): Promise<any> {
    try {
      const filteredEntries = Object.entries(fieldValues).filter(([key, value]) => value !== employeeIdentifierValue);
      const fieldValuesFiltered = Object.fromEntries(filteredEntries);

      let employee = await this.getClockInEmployeeByIdentifier(operationToken, employeeIdentifierValue);
      if (employee === null || employee === undefined) {
        throw new Error('Employé non trouvé');
      }

      const fieldValuesIris = []
      for (const [cle, valeur] of Object.entries(fieldValuesFiltered)) {
        const fieldValue = await this.createFieldValue(operationToken, { customField: cle, value: valeur });
        fieldValuesIris.push(fieldValue['@id']);
      }

      await this.axios.post('/api/clock_ins', {
        operation: `/api/operations/${operationToken}`,
        clockInEmployee: `/api/${operationToken}/clock_in_employees/${employee.id}`,
        fieldValues: fieldValuesIris,
      });

      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getClockIns(): Promise<Pointer[]> {
    try {
      const { operation_token } = sessionStorage;
      const response: any = await this.axios.get(
        `/api/${operation_token}/clock_ins`
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createAddress(data: any): Promise<any> {
    try {
      const { street, zip, city } = data;
      const body = {
        street,
        zip,
        city,
      };
      const response = await this.axios.post('/api/addresses', body);
      return response.data;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

}
