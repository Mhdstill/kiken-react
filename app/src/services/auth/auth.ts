export enum Role {
  USER = 'ROLE_USER',
  CLIENT = 'ROLE_ADMIN_CLIENT',
  ADMIN = 'ROLE_ADMIN',
}

export enum FileAction {
  UPLOAD_FILE = 'UPLOAD_FILE',
  CREATE_FOLDER = 'CREATE_FOLDER',
  DELETE_FILE = 'DELETE_FILE',
  EDIT_ACCESS = 'EDIT_ACCESS',
  EDIT_FILENAME = 'EDIT_FILENAME',
  SHOW_FILE = 'SHOW_FILE',
  SHOW_QRCODE = 'SHOW_QRCODE',
}

export enum OperationAction {
  CREATE_OPERATION = 'CREATE_OPERATION',
  DELETE_OPERATION = 'DELETE_OPERATION',
  MODIFY_OPERATION = 'MODIFY_OPERATION',
}

export enum UserAction {
  CREATE_USER = 'CREATE_USER',
  DELETE_USER = 'DELETE_USER',
  MODIFY_USER = 'MODIFY_USER',
}

export enum ModuleAction {
  CREATE_MODULE = 'CREATE_MODULE',
  DELETE_MODULE = 'DELETE_MODULE',
  MODIFY_MODULE = 'MODIFY_MODULE',
}

export enum UpdateAction {
  CREATE_UPDATE = 'CREATE_UPDATE',
  DELETE_UPDATE = 'DELETE_UPDATE',
  MODIFY_UPDATE = 'MODIFY_UPDATE',
}

export enum PointerAction {
  SHOW_POINTER_QR = 'SHOW_POINTER_QR',
  CREATE_POINTER_FIELD = 'CREATE_POINTER_FIELD',
  DELETE_POINTER_FIELD = 'DELETE_POINTER_FIELD',
  MODIFY_POINTER_FIELD = 'MODIFY_POINTER_FIELD',
}

export enum ModalAction {
  CLOSE_MODAL = 'CLOSE_MODAL',
}

export type Action = FileAction | OperationAction | UserAction | PointerAction | ModalAction | UpdateAction;

const userPermissions: {
  [key in FileAction | OperationAction | UserAction | ModalAction | ModuleAction | PointerAction | UpdateAction]:
  | Role[]
  | null;
} = {

  [FileAction.UPLOAD_FILE]: [Role.CLIENT, Role.ADMIN],
  [FileAction.CREATE_FOLDER]: [Role.CLIENT, Role.ADMIN],
  [FileAction.DELETE_FILE]: [Role.CLIENT, Role.ADMIN],
  [FileAction.EDIT_ACCESS]: [Role.CLIENT, Role.ADMIN],
  [FileAction.EDIT_FILENAME]: [Role.CLIENT, Role.ADMIN],
  [FileAction.SHOW_FILE]: null,
  [FileAction.SHOW_QRCODE]: [Role.CLIENT, Role.ADMIN],

  [OperationAction.CREATE_OPERATION]: [Role.ADMIN],
  [OperationAction.DELETE_OPERATION]: [Role.ADMIN],
  [OperationAction.MODIFY_OPERATION]: [Role.ADMIN],

  [UpdateAction.CREATE_UPDATE]: [Role.ADMIN],
  [UpdateAction.DELETE_UPDATE]: [Role.ADMIN],
  [UpdateAction.MODIFY_UPDATE]: [Role.ADMIN],

  [UserAction.CREATE_USER]: [Role.CLIENT],
  [UserAction.DELETE_USER]: [Role.CLIENT],
  [UserAction.MODIFY_USER]: [Role.CLIENT],

  [ModuleAction.CREATE_MODULE]: [Role.ADMIN],
  [ModuleAction.MODIFY_MODULE]: [Role.ADMIN],
  [ModuleAction.DELETE_MODULE]: [Role.ADMIN],

  [PointerAction.SHOW_POINTER_QR]: [Role.CLIENT, Role.ADMIN],
  [PointerAction.CREATE_POINTER_FIELD]: [Role.CLIENT, Role.ADMIN],
  [PointerAction.DELETE_POINTER_FIELD]: [Role.CLIENT, Role.ADMIN],
  [PointerAction.MODIFY_POINTER_FIELD]: [Role.CLIENT, Role.ADMIN],


  [ModalAction.CLOSE_MODAL]: null,
};

const operationPermissions: {
  [key in FileAction | OperationAction | UserAction | ModalAction | ModuleAction | PointerAction | UpdateAction]:
  | string
  | null;
} = {
  [FileAction.UPLOAD_FILE]: "QRD",
  [FileAction.CREATE_FOLDER]: "QRD",
  [FileAction.DELETE_FILE]: "QRD",
  [FileAction.EDIT_ACCESS]: "QRD",
  [FileAction.EDIT_FILENAME]: "QRD",
  [FileAction.SHOW_FILE]: "QRD",
  [FileAction.SHOW_QRCODE]: "QRD",

  [PointerAction.SHOW_POINTER_QR]: "PT",
  [PointerAction.CREATE_POINTER_FIELD]: "PT",
  [PointerAction.DELETE_POINTER_FIELD]: "PT",
  [PointerAction.MODIFY_POINTER_FIELD]: "PT",

  [OperationAction.CREATE_OPERATION]: null,
  [OperationAction.DELETE_OPERATION]: null,
  [OperationAction.MODIFY_OPERATION]: null,

  [UpdateAction.CREATE_UPDATE]: null,
  [UpdateAction.DELETE_UPDATE]: null,
  [UpdateAction.MODIFY_UPDATE]: null,

  [UserAction.CREATE_USER]: null,
  [UserAction.DELETE_USER]: null,
  [UserAction.MODIFY_USER]: null,

  [ModuleAction.CREATE_MODULE]: null,
  [ModuleAction.MODIFY_MODULE]: null,
  [ModuleAction.DELETE_MODULE]: null,

  [ModalAction.CLOSE_MODAL]: null,
};


export default userPermissions;

export const isAuthorized = (action: Action) => {
  return userHasAccess(action) && operationHasAccess(action);
};

export const userHasAccess = (action: Action) => {
  const role = sessionStorage.getItem('role');
  if (role) {
    const perm = userPermissions[action];
    if (perm === null) {
      return true;
    }
    return !!perm.find((allowedRole) => role === allowedRole);
  }
  return false;
};

export const operationHasAccess = (action: Action) => {
  const modulesString = sessionStorage.getItem('modules');

  if (!modulesString) {
    return false;
  }

  const perm = operationPermissions[action];
  if (perm === null) {
    return true;
  }

  const modules = JSON.parse(modulesString);
  return modules.includes(perm);
};
