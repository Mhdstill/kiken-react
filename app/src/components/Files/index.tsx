import React, { FC, useEffect, useReducer, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormInstance, Popconfirm, Tag, Tooltip, Upload, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faImage, faFile, faFilePdf, faFileWord, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {
  DeleteOutlined,
  EditOutlined,
  FileImageOutlined,
  FileOutlined,
  FolderAddOutlined,
  FolderOutlined,
  QrcodeOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import type { FilterValue } from 'antd/lib/table/interface';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';

import TableView from '../TableHomeView';
import ModalForm from '../Modal/ModalForm';
import withDataManager, {
  WithDataManagerProps,
} from '../../hoc/withDataManager';
import withTranslation from '../../hoc/withTranslation';
import {
  getFormattedDate,
  getUrlWithQueryParams,
  showErrorNotification,
  showSpecificErrorNotification,
  showSuccesNotification,
} from '../../services/utils';
import {
  FileAction as Action,
  isAuthorized,
  ModalAction,
} from '../../services/auth/auth';
import { Type, getSize } from '../../types/File';
import type File from '../../types/File';
import type User from '../../types/User';

import '../../style.less';
import DragAndDrop from '../DragAndDrop';

interface FileType extends File {
  key: React.Key;
  path: string;
  type: string;
  size?: number;
  extension?: string;
}

const FilesPage: FC<WithTranslation & WithDataManagerProps> = ({
  dataManager,
  t,
}) => {
  const params = useParams();
  const operationToken = params.operationToken as string;
  const folderId = params.folderId;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  if (
    searchParams.has('download') &&
    (!searchParams.has('id') || !searchParams.has('name'))
  ) {
    navigate(location.pathname);
  }

  const fileUpload = useMutation(
    (options: any): any => {
      const data = new FormData();
      data.set('operationID', operationToken);
      data.set('folderID', folders?.root.id);
      data.set('file', options.file, options.file.name);
      data.set('name', options.file.name);
      data.set('size', options.file.size);
      return dataManager.uploadFile(data);
    },
    {
      onSuccess: (data: any) => {
        let file = data.name;
        showSuccesNotification('fileImported', t, { file });
        hideModal();
        refetch();
      },
      onError: (e: any) => {
        showSpecificErrorNotification(e.message, t);
      },
    }
  );

  const triggerDownload = (filename: string, data: string) => {
    const a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      window.URL.revokeObjectURL(data); // Delay revoking the ObjectURL for Firefox
    }, 100);
  };

  const downloadFile = (file: FileType) => {
    dataManager
      .downloadFile(operationToken, file.id)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
       /* if (blob.type.indexOf('image') > -1 || blob.type === 'application/pdf') {
          modalDispatch({
            type: Action.SHOW_FILE,
            imageFile: url,
            onOk: () => triggerDownload(file.name, url),
            okText: t('modal.download'),
          });
        } else { */
          triggerDownload(file.name, url);
       // }
      })
      .catch(console.error);
  };

  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});

  const getExtension = (path: string) => {
    const split = path.split('.');
    return split[split.length - 1];
  };

  const getFolders = async () => {
    let folder;
    try {
      if (folderId) {
        folder = await dataManager.getFolder(operationToken, folderId);
      } else {
        folder = (await dataManager.getRootFolder(operationToken))[0];
      }
      let i = 1;
      const getParentTree = async (folder: any, tree: any[] = []): Promise<any[]> => {
        if (tree.length == 0) {
          tree.unshift(folder);
        }
        if (folder.parent) {
          tree.unshift(folder.parent);
          return getParentTree(folder.parent, tree);
        } else {
          return tree;
        }
      };
      let tree = await getParentTree(folder);
      const folders = folder.subfolders.map((folder: FileType) => {
        const path = `/${operationToken}/folder/${folder.id}`;
        return Object.assign(folder, { key: i++, type: Type.FOLDER, path });
      });
      const files = folder.mediaObjects.map((file: FileType) => {
        const type =
          Type[
          (file.extension
            ? file.extension.toLowerCase()
            : getExtension(file.path)) as keyof typeof Type
          ] || Type.FILE;
        const path = `/media_objects/${file.path}`;
        return Object.assign(file, { key: i++, name: file.name, type, path });
      });
      const data = folders.concat(files);
      return { root: folder, data, tree };
    } catch (error) {
      console.error(error);
      return { root: folder || null, data: [], tree: [] };
    }
  };



  const {
    data: folders,
    isFetching,
    refetch,
  } = useQuery(['folders'], getFolders, {
    onSuccess: (folders) => {
      if (
        searchParams.has('download') &&
        searchParams.has('id') &&
        searchParams.has('name')
      ) {
        const file = folders.data.find(
          (f: FileType) =>
            f['@type'] !== Type.FOLDER &&
            f.id == searchParams.get('id') &&
            f.name === searchParams.get('name')
        );
        downloadFile(file);
      }
    },
    onError: (e) => {
      console.error(e);
    },
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    refetch();
  }, [location]);

  const getFileIcon = (record: any) => {
    let defaultReturn = <FontAwesomeIcon icon={faFile} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;

    const type = record['@type'];
    if (type === Type.FOLDER) {
      defaultReturn = <FontAwesomeIcon icon={faFolder} style={{ fontSize: "22px", color: "orange", position: "relative", top: "4px", }} className='me-2' />;
    } else if (type === Type.FILE) {
      const extension = record['extension'];
      if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
        defaultReturn = <FontAwesomeIcon icon={faImage} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;
      } else if (extension === 'pdf') {
        defaultReturn = <FontAwesomeIcon icon={faFilePdf} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;
      } else if (extension === 'eml') {
        defaultReturn = <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;
      } else if (extension === 'docx') {
        defaultReturn = <FontAwesomeIcon icon={faFileWord} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;
      }
    }

    return defaultReturn;
  };

  const [modalFormData, setModalFormData] = useState<any | null>(null);

  const handleUserAccessForm = (changedValues: any, allValues: any, defaultUsers: any | null = null) => {
    const undefinedCount = allValues.users.filter((userID: string) => userID === 'undefined' || !userID).length;
    let userIDs: string[] = [];
    if (defaultUsers && Array.isArray(defaultUsers)) {
      userIDs = defaultUsers
        .map(user => user['@id'])
        .slice(0, undefinedCount)
    }

    const validUserIDs = allValues.users.filter((userID: string) => userID && userID !== 'undefined');

    const values = {
      users: [...userIDs, ...validUserIDs],
    };

    setModalFormData(values);
  };


  const handleFormValues = (changedValues: any, allValues: any) => {
    setModalFormData(allValues);
  };

  let [users, setUsers] = useState<any>([]);
  if (isAuthorized(Action.EDIT_ACCESS)) {
    useQuery(
      ['users'],
      async () => {
        console.log(operationToken);
        return await dataManager.getUsersByOperationToken(operationToken);
      },
      {
        onSuccess: (data: User[]) => {
          const users = data.map((user: User) => ({
            id: user['@id'],
            label: user.email,
          }));
          setUsers(users);
        },
        onError: console.error,
        refetchOnWindowFocus: false,
      }
    );
  }

  const updateAccess = useMutation(
    (): any => {
      return dataManager.editFileAccess(
        operationToken,
        modalState.selectedFile,
        modalFormData.users
      );
    },
    {
      onSuccess: () => {
        if (Type.FOLDER === modalState.selectedFile['@type']) {
          showSuccesNotification('folderAccessUpdated', t, {
            directory: modalState.selectedFile.name,
          });
        } else {
          showSuccesNotification('fileAccessUpdated', t, {
            file: modalState.selectedFile.name,
          });
        }
        refetch();
      },
      onError: (e) => {
        console.error(e);
        showErrorNotification(e, t);
      },
    }
  );

  const createDirectory = useMutation(
    (): any => {
      return dataManager.createDirectory(operationToken, {
        name: modalFormData.directoryName,
        parent: folders?.root['@id'],
      });
    },
    {
      onSuccess: () => {
        showSuccesNotification('directoryCreated', t, {
          directory: modalFormData.directoryName,
        });
        refetch();
      },
      onError: (e) => {
        console.error(e);
        showErrorNotification(e, t);
      },
    }
  );

  const renameFile = useMutation(
    (): any => {
      return dataManager.renameFile(
        operationToken,
        modalState.selectedFile,
        modalFormData.name
      );
    },
    {
      onSuccess: () => {
        if (Type.FOLDER === modalState.selectedFile['@type']) {
          showSuccesNotification('folderUpdated', t, {
            directory: modalFormData.name,
          });
        } else {
          showSuccesNotification('fileUpdated', t, {
            file: modalFormData.name,
          });
        }
        refetch();
      },
      onError: (e) => {
        console.error(e);
        showErrorNotification(e, t);
      },
    }
  );

  const modalOnOk = async (form?: FormInstance) => {
    const formData = form?.getFieldsValue();
    if (modalState.action && (modalFormData || formData)) {
      switch (modalState.action) {
        case Action.EDIT_ACCESS:
          updateAccess.mutate();
          break;
        case Action.EDIT_FILENAME:
          renameFile.mutate();
          break;
        case Action.CREATE_FOLDER:
          createDirectory.mutate();
          break;
      }
    }
    hideModal();
  };

  const modalReducer = (prevState: any, action: any) => {
    if (action.file && action.file.users) {
      let users = [];
      Object.entries(action.file.users).forEach(([key, val]) => {
        //  console.log(val.email);
      });
    }
    switch (action.type) {
      case Action.EDIT_ACCESS:
        let defaultUsers = action.file.users
        return {
          action: Action.EDIT_ACCESS,
          selectedFile: action.file,
          content: (
            <ModalForm
              inputs={[
                {
                  name: 'users',
                  possibleValues: users,
                  values: action.file.users?.map((user: User) => ({
                    id: user['@id'],
                    label: user.email,
                  })),
                },
              ]}
              onFormValueChange={function (changedValues, allValues) { handleUserAccessForm(changedValues, allValues, defaultUsers) }}
              submit={modalOnOk}
            />
          ),
          showModal: true,
        };
      case Action.EDIT_FILENAME:
        return {
          action: Action.EDIT_FILENAME,
          selectedFile: action.file,
          content: (
            <ModalForm
              inputs={[{ name: 'name', value: action.file.name }]}
              onFormValueChange={handleFormValues}
              submit={modalOnOk}
            />
          ),
          showModal: true,
        };
      case Action.CREATE_FOLDER:
        return {
          action: Action.CREATE_FOLDER,
          content: (
            <ModalForm
              inputs={[{ name: 'directoryName' }]}
              onFormValueChange={handleFormValues}
              submit={modalOnOk}
            />
          ),
          showModal: true,
        };
      case Action.UPLOAD_FILE:
        return {
          action: Action.UPLOAD_FILE,
          content: (
            <DragAndDrop customRequest={fileUpload.mutate} showUploadList={false} />
          ),
          showModal: true,
          onOk: action.onOk,
          okText: action.okText
        };
      case Action.SHOW_QRCODE:
        return {
          content: (
            <QRCodeCanvas
              id="qrcode"
              onClick={() => window.open(action.qrCodeValue, '_blank')}
              value={action.qrCodeValue}
            />
          ),
          showModal: true,
          onOk: action.onOk,
          okText: action.okText,
        };
      case Action.SHOW_FILE:
        return {
          content: (
            <img
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
              src={action.imageFile}
            />
          ),
          showModal: true,
          onOk: action.onOk,
          okText: action.okText,
        };
      case ModalAction.CLOSE_MODAL:
      default:
        setModalFormData(null);
        return {
          selectedFile: null,
          content: null,
          showModal: false,
          onOk: undefined,
          okText: undefined,
        };
    }
  };

  const [modalState, modalDispatch] = useReducer(modalReducer, {
    selectedFile: null,
    content: null,
    showModal: false,
    onOk: undefined,
    okText: undefined,
  });

  const getNameComponent = (record: FileType) => {
    if (record['@type'] === Type.FOLDER) {
      return (
        <Link onClick={() => setFilteredInfo({})} to={record.path}>
          {record.name}
        </Link>
      );
    }
    return <a onClick={() => downloadFile(record)}>{record.name}</a>;
  };


  const columns: ColumnsType<FileType> = [
    {
      key: 'name',
      title: t('name'),
      ellipsis: {
        showTitle: false,
      },
      align: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => (
        <Tooltip placement="bottomLeft" title={record.name}>
          <span style={{textAlign: 'left'}}>
            {getFileIcon(record)} {getNameComponent(record)}
          </span>
        </Tooltip>
      ),
    },
    {
      key: 'size',
      title: 'Taille',
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => (
        <Tooltip placement="bottomLeft" title={record.name}>
          {getSize(record)}
        </Tooltip>
      ),
    },
    {
      key: 'createdAt',
      title: t('createdAt'),
      dataIndex: 'createdAt',
      responsive: ['md'],
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: getFormattedDate,
    },
    {
      key: 'updatedAt',
      title: t('updatedAt'),
      dataIndex: 'updatedAt',
      responsive: ['md'],
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: getFormattedDate,
    },

  ];

  const deleteFile = useMutation(
    (file: FileType): any => {
      if (Type.FOLDER === file['@type']) {
        return dataManager.deleteFolder(operationToken, file);
      } else {
        return dataManager.deleteFile(operationToken, file);
      }
    },
    {
      onSuccess: (file: FileType) => {
        if (Type.FOLDER === file['@type']) {
          showSuccesNotification('folderDeleted', t, { directory: file.name });
        } else {
          showSuccesNotification('fileDeleted', t, { file: file.name });
        }
        refetch();
      },
      onError: (e) => {
        showSuccesNotification('fileDeleted', t, { file: '' });
        refetch();
        return;

        console.error(e);
        showErrorNotification(e, t);
      },
    }
  );

  /**
   * Add actions
   */
  const permissions = [
    Action.SHOW_QRCODE,
    Action.EDIT_ACCESS,
    Action.EDIT_FILENAME,
    Action.DELETE_FILE,
  ].filter((action) => isAuthorized(action));

  if (permissions.length > 0) {
    columns.push({
      key: 'actions',
      title: 'Actions',
      render: (value, record) => (
        <>
          {permissions.indexOf(Action.SHOW_QRCODE) > -1 && (
            <QrcodeOutlined
              onClick={() => {
                let url: string;
                if (record['@type'] === Type.FOLDER) {
                  url = `${window.location.origin}/${operationToken}/folder/${record.id}`;
                } else {
                  const { id, name } = record;
                  url = getUrlWithQueryParams(
                    `${window.location.origin}${location.pathname}`,
                    {
                      id,
                      name,
                      download: true,
                    }
                  ).toString();
                }
                modalDispatch({
                  type: Action.SHOW_QRCODE,
                  qrCodeValue: url,
                  onOk: () => {
                    const canvas = document.getElementById('qrcode') as HTMLCanvasElement;
                    if (canvas) {
                      const url = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.download = `qrcode-${record.name.split('.')[0]}.png`;
                      link.href = url;
                      link.click();
                    }
                  },
                  okText: t('modal.download'),
                });
              }}
            />
          )}
          {permissions.indexOf(Action.EDIT_ACCESS) > -1 && (
            <UserOutlined
              className="access"
              onClick={() => {
                modalDispatch({
                  type: Action.EDIT_ACCESS,
                  file: record,
                });
              }}
            />
          )}
          {permissions.indexOf(Action.EDIT_FILENAME) > -1 && (
            <EditOutlined
              className="edit"
              onClick={() => {
                modalDispatch({
                  type: Action.EDIT_FILENAME,
                  file: record,
                });
              }}
            />
          )}
          {permissions.indexOf(Action.DELETE_FILE) > -1 && (
            <Popconfirm
              title={t('confirm.title')}
              okText={t('confirm.ok')}
              cancelText={t('confirm.cancel')}
              onConfirm={() => deleteFile.mutate(record)}
            >
              <DeleteOutlined className="delete" />
            </Popconfirm>
          )}
        </>
      ),
    });
  }

  /**
   * New file/folder buttons
   */
  const items: MenuProps['items'] = [];
  if (isAuthorized(Action.CREATE_FOLDER)) {
    items.push({
      label: (
        <div
          onClick={() => {
            modalDispatch({
              type: Action.CREATE_FOLDER,
            });
          }}
        >
          <FolderAddOutlined /> {t('folder.new')}
        </div>
      ),
      key: 'folder',
    });
  }
  if (isAuthorized(Action.UPLOAD_FILE)) {
    items.push({
      label: (
        <div
          onClick={() => {
            modalDispatch({
              type: Action.UPLOAD_FILE,
              onOk: () => { },
              okText: false
            });
          }}
        >
          <UploadOutlined /> {t('file.upload')}
        </div>
      ),
      key: 'file',
    });
  }

  const hideModal = () => {
    modalDispatch({
      type: ModalAction.CLOSE_MODAL,
    });
  };


  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)
  useEffect(() => {
    if (folders && folders?.data) {
      setIsLoadingInitialData(false);
    }
  }, [folders]);


  return (
    <>
      <TableView
        data={folders?.data}
        tree={folders?.tree}
        isFetching={isLoadingInitialData}
        actionsItems={items}
        columns={columns}
        formData={modalFormData}
        setFormData={setModalFormData}
        modalOnOkHandler={modalState.onOk || modalOnOk}
        hideModalHandler={hideModal}
        showModal={modalState.showModal}
        modalContent={modalState.content}
        okText={modalState.okText}
      />
    </>
  );
};

export default withTranslation(withDataManager(FilesPage));
