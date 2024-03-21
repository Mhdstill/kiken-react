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
import moment from 'moment';
import Update from '../../types/Update';

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
        operations: response.data.operations,
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
      const { operation_token } = sessionStorage;
      if (!operation_token) {
        throw new Error('Operation non valide');
      }
      const op = await this.getOperation(operation_token);
      if (!op) {
        throw new Error('Operation non valide');
      }

      const fileSize = data.get('size');
      console.log(fileSize, op.size, op.limitDrive);
      if (!fileSize || (!op.size && op.size !== 0) || !op.limitDrive) {
        throw new Error('Taille du fichier requise');
      }
      const fileSizeInt = parseInt(fileSize.toString());
      if (fileSizeInt + op.size >= op.limitDrive) {
        await this.createNotification({ title: 'Fichier non importé', content: 'Le fichier "' + data.get('name') + '" n\'a pas été importé pour cause de manque d\'espace.', icon: 'fa-warning' }, operation_token)
        throw new Error('Espace de stockage complet');
      }
      const response = await this.axios.post('/api/media_objects', data);
      await this.createNotification({ title: 'Fichier ajouté', content: 'Le fichier "' + data.get('name') + '" a bien été ajouté à votre QR Drive.', icon: 'fa-file' }, operation_token)
      return response.data;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async uploadGeneralFile(data: FormData): Promise<any> {
    try {
      const response = await this.axios.post('/api/general_files', data);
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
      await this.createNotification({ title: 'Dossier créé', content: 'Le dossier "' + name + '" a été créé avec succès.', icon: 'fa-folder' }, operationToken)
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
      await this.createNotification({ title: 'Fichier supprimé', content: 'Le fichier "' + file.name + '" a été supprimé avec succès.', icon: 'fa-trash' }, operationToken)
      return file;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteGeneralFile(operationToken: string, file: File): Promise<File> {
    try {
      await this.axios.delete(
        `/api/${operationToken}/general_files/${file.id}`
      );
      return file;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteFolder(operationToken: string, folder: File): Promise<File> {
    try {
      await this.axios.delete(`/api/${operationToken}/folders/${folder.id}`);
      await this.createNotification({ title: 'Dossier supprimé', content: 'Le dossier "' + folder.name + '" a été supprimé avec succès.', icon: 'fa-trash' }, operationToken)
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
      await this.createNotification({ title: 'Fichier renommé', content: 'Le fichier "' + file.name + '" a été renommé "' + newName + '".', icon: 'fa-file' }, operationToken)
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
      await this.createNotification({ title: 'Accès fichier modifiés', content: 'Les accès du fichier "' + file.name + '" ont été modifié.', icon: 'fa-file' }, operationToken)
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createUser(data: any): Promise<boolean> {
    try {
      const { email, password, operations } = data;
      let body: any = {
        email,
        password,
      };
      const { role: userRole } = sessionStorage;
      let req;
      if (userRole === Role.ADMIN) {
        body = { ...body, operations, roles: [Role.CLIENT] };
        req = await this.axios.post('/api/users', body);
      } else { 
        console.log(operations);
        let operationIRI = `/api/operations/${operations[0]}`
        body = { ...body, operations: [operationIRI] };
        req = await this.axios.post('/api/users/client', body);
        //req = await this.axios.post(`/api/${operation}/users`, body);
      }

      //await this.createNotification({ title: 'Utilisateur créé', content: 'L\'utilisateur "' + email + '" a été ajouté à votre opération.', icon: 'fa-user' }, operation.id)
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


  /** UPDATE */
  async getUpdate(id: string): Promise<Update> {
    try {
      const response: any = await this.axios.get(`/api/updates/${id}`);
      return response.data;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async getUpdates(): Promise<Update[]> {
    try {
      const response: any = await this.axios.get(
        `/api/updates`
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createUpdate(data: any): Promise<boolean> {
    try {
      const { version, content } = data;
      let body: any = {
        version,
        content,
      };
      let req;
      req = await this.axios.post('/api/updates', body);

      const operation_token = sessionStorage.getItem('operation_token');
      if (operation_token) {
        await this.createNotification({ title: 'Nouvelle mise à jour', content: 'La mise à jour ' + version + ' a été ajouté à l\'application', icon: 'fa-user' }, operation_token)
      }
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async updateUpdate(update: Update, data: any): Promise<boolean> {
    try {
      const { version, content } = data;
      const body = {
        version,
        content,
      };
      await this.axios.put(`/api/updates/${update.id}`, body);
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteUpdate(update: Update): Promise<Update> {
    try {
      await this.axios.delete(`/api/updates/${update.id}`);
      return update;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  /** Notifications */
  async getNotifications(): Promise<Update[]> {
    try {
      const operation_token = sessionStorage.getItem('operation_token');
      if (!operation_token) {
        throw new Error("No operation token provided and none found in sessionStorage.");
      }

      const response: any = await this.axios.get(
        `/api/${operation_token}/updates`
      );
      return response.data['hydra:member'];
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createNotification(data: any, operationToken: string): Promise<boolean> {
    try {
      if (!operationToken) {
        throw new Error("No operation token provided and none found in sessionStorage.");
      }

      const { title, content, icon } = data;
      let body: any = {
        title,
        content,
        operation: `/api/operations/${operationToken}`,
        icon: icon
      };
      let req;
      req = await this.axios.post('/api/notifications', body);
      return true;
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
      await this.createNotification({ title: 'Nouveau champs', content: 'Le champs "' + label + '" a été ajouté au QR Form', icon: 'fa-form' }, operation_token)
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
      await this.createNotification({ title: 'Champs modifié', content: 'Le champs "' + label + '" a été modifié au QR Form', icon: 'fa-form' }, field.operation.id)
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async deleteField(field: PointerField): Promise<PointerField> {
    try {
      await this.axios.delete(`/api/fields/${field.id}`);
      console.log(field);
      await this.createNotification({ title: 'Champs supprimé', content: 'Le champs "' + field.label + '" a été supprimé du QR Form', icon: 'fa-trash' }, field.operation.id)
      return field;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }



  async updateUser(user: User, data: any): Promise<boolean> {
    try {
      const { email, password, operations } = data;
      const { operation_token, role } = sessionStorage;
      const body = {
        email,
        password,
        operations
      };
      if (operation_token && role === Role.CLIENT) {
        await this.axios.put(`/api/${operation_token}/users/${user.id}`, body);
      } else {
        await this.axios.put(`/api/users/${user.id}`, body);
      }
      await this.createNotification({ title: 'Utilisateur modifié', content: 'L\'utilisateur "' + email + '" a été modifié avec succès.', icon: 'fa-user' }, operation_token)
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
      await this.createNotification({ title: 'Utilisateur supprimé', content: 'L\'utilisateur "' + user.email + '" a été supprimé de l\'opération.', icon: 'fa-trash' }, operation_token)
      return user;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async createOperation(data: any): Promise<boolean> {
    try {
      const { name, modules, limitDrive, limitOperation, limitUser } = data;
      const body = {
        name,
        modules,
        limitDrive: (limitDrive) ? limitDrive.toString() : null,
        limitUser: parseInt(limitUser),
        limitOperation: parseInt(limitOperation)
      };
      const op = await this.axios.post('/api/operations', body);
      const opID = op.data['id'];
      this.createField({ "label": "Email", "type": 3, "isUnique": true, "allwaysFill": true, "isRequired": true }, opID)
      return true;
    } catch (err) {
      throw new Error((err.response && err.response.statusText) ? err.response.statusText : err);
    }
  }

  async updateOperation(operationToken: string, data: any): Promise<any> {
    try {
      const { name, modules, useClockInGeolocation, distance, street, zip, city, isDarkMode, logo, limitDrive, limitOperation, limitUser } = data;

      let addressIRI = null;
      if (street && zip && city) {
        const address = await this.createAddress({ street, zip, city })
        addressIRI = (address) ? address['@id'] : '';
      }

      let body: {
        name: any;
        modules: any;
        useClockInGeolocation: any;
        distance: any;
        isDarkMode: any;
        address?: string;
        logo?: string;
        limitDrive?: number;
        limitOperation?: number;
        limitUser?: number;
      } = {
        name,
        modules,
        useClockInGeolocation,
        distance,
        isDarkMode,
      };

      if (limitDrive) {
        body = { ...body, limitDrive: limitDrive.toString() };
      } 

      if (limitOperation) {
        body = { ...body, limitOperation: parseInt(limitOperation) };
      } 

      if (limitUser) {
        body = { ...body, limitUser: parseInt(limitUser) };
      } 

      if (addressIRI) {
        body.address = addressIRI;
      }

      if (logo) {
        const data = new FormData();
        data.set('operationID', operationToken);
        data.set('file', logo, logo.name);
        data.set('name', logo.name);
        const response = await this.uploadGeneralFile(data);
        body.logo = response['@id'];
      }

      const response = await this.axios.put(`/api/operations/${operationToken}`, body);
      return response.data;
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

      let formattedValue = value;
      if (typeof value === 'boolean') {
        formattedValue = value ? "Oui" : "Non"
      } else if (moment.isMoment(value)) {
        if (value.hours() === 0 && value.minutes() === 0 && value.seconds() === 0) {
          formattedValue = value.format('DD/MM/YYYY');
        } else {
          formattedValue = value.format('DD/MM/YYYY HH:mm');
        }
      }

      const body = {
        value: formattedValue,
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
