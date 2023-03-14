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

export enum ModalAction {
  CLOSE_MODAL = 'CLOSE_MODAL',
}

export type Action = FileAction | OperationAction | UserAction | ModalAction;

const permissions: {
  [key in FileAction | OperationAction | UserAction | ModalAction]:
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
  [UserAction.CREATE_USER]: [Role.CLIENT, Role.ADMIN],
  [UserAction.DELETE_USER]: [Role.CLIENT, Role.ADMIN],
  [UserAction.MODIFY_USER]: [Role.CLIENT, Role.ADMIN],
  [ModalAction.CLOSE_MODAL]: null,
};

export default permissions;

export const isAuthorized = (action: Action) => {
  const role = sessionStorage.getItem('role');
  if (role) {
    const perm = permissions[action];
    if (perm === null) {
      return true;
    }
    return !!perm.find((allowedRole) => role === allowedRole);
  }
  return false;
};
