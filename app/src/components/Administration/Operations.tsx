import React, { FC, useEffect, useReducer, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormInstance, MenuProps, Popconfirm, Tooltip } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import type { WithTranslation } from 'react-i18next';
import Module from '../../types/Module';

import TableView from '../TableView';
import ModalForm from '../Modal/ModalForm';
import withDataManager, {
  WithDataManagerProps,
} from '../../hoc/withDataManager';
import withTranslation from '../../hoc/withTranslation';
import {
  getFormattedDate,
  showErrorNotification,
  showSuccesNotification,
} from '../../services/utils';
import {
  isAuthorized,
  ModalAction,
  OperationAction,
} from '../../services/auth/auth';
import { OperationAction as Action } from '../../services/auth/auth';
import type Operation from '../../types/Operation';

import '../../style.less';
import { getGeneralSize, getSize } from '../../types/File';

interface OperationType extends Operation {
  key: React.Key;
}

const OperationsPage: FC<
  WithTranslation & WithDataManagerProps & { inTab?: boolean }
> = ({ dataManager, t, inTab }) => {
  const getOperations = async () => {
    const ops = await dataManager.getOperations();
    return ops.map((op, i) => {
      return Object.assign(op, { key: i });
    });
  };

  const {
    data: operations,
    isFetching,
    refetch,
  } = useQuery(['operations'], getOperations, {
    onError: (e) => {
      console.error(e);
    },
    refetchOnWindowFocus: false,
    refetchInterval: 4000,
    refetchIntervalInBackground: true,
  });

  const [modalFormData, setModalFormData] = useState<any | null>(null);
  let [modules, setModules] = useState<any>([]);
  if (isAuthorized(Action.MODIFY_OPERATION)) {
    useQuery(
      ['modules'],
      async () => {
        return await dataManager.getModules();
      },
      {
        onSuccess: (data: any[]) => {
          const modules = data.map((module: any) => ({
            id: module['@id'],
            label: module.name,
          }));
          setModules(modules);
        },
        onError: console.error,
        refetchOnWindowFocus: false,
      }
    );
  }

  const handleFormValues = (changedValues: any, allValues: any, defaultModules: any) => {
    const undefinedCount = allValues.modules.filter((moduleID: string) => moduleID === 'undefined' || !moduleID).length;
    let moduleIDs: string[] = [];
    if (defaultModules && Array.isArray(defaultModules)) {
      moduleIDs = defaultModules
        .map(module => module['@id'])
        .slice(0, undefinedCount)
    }
    const validModuleIDs = allValues.modules.filter((moduleID: string) => moduleID && moduleID !== 'undefined');

    // Extraire seulement les IRI pour les modules
    const values = {
      ...allValues,
      modules: [...moduleIDs, ...validModuleIDs.map((module: Module) => module.id || module)], // S'assurer de n'obtenir que les IRI
    };

    setModalFormData(values);
  };


  const modalOnOk = async (form?: FormInstance) => {
    const formData = form?.getFieldsValue();
    if (modalState.action && (modalFormData || formData)) {
      switch (modalState.action) {
        case Action.CREATE_OPERATION:
          createOperation.mutate();
          refetch();
          break;
        case Action.MODIFY_OPERATION:
          editOperation.mutate();
          refetch();
          break;
      }
    }
    hideModal();
  };

  const modalReducer = (prevState: any, action: any) => {
    let defaultModules = (action && action.operation && action.operation.modules) ? action.operation.modules : [];
    switch (action.type) {
      case Action.CREATE_OPERATION:
        return {
          action: Action.CREATE_OPERATION,
          content: (
            <ModalForm
              inputs={[
                { name: 'operationName' },
                {
                  name: 'modules',
                  possibleValues: modules,
                },
                {
                  name: 'limitDrive',
                },
                {
                  name: 'limitUser',
                },
                {
                  name: 'limitOperation',
                }
              ]}
              onFormValueChange={function (changedValues, allValues) { setModalFormData(allValues) }}
              submit={modalOnOk}
            />
          ),
          showModal: true,
        };
      case Action.MODIFY_OPERATION:
        return {
          action: Action.MODIFY_OPERATION,
          selectedOperation: action.operation,
          content: (
            <ModalForm
              inputs={[
                { name: 'operationName', value: action.operation.name },
                {
                  name: 'modules',
                  possibleValues: modules,
                  values: action.operation.modules?.map((module: any) => ({
                    id: module['@id'],
                    label: module.name,
                  })),
                },
                {
                  name: 'limitDrive',
                  value: action.operation.limitDrive
                },
                {
                  name: 'limitUser',
                  value: action.operation.limitUser
                },
                {
                  name: 'limitOperation',
                  value: action.operation.limitOperation
                }
              ]}
              onFormValueChange={function (changedValues, allValues) { handleFormValues(changedValues, allValues, defaultModules) }}
              submit={modalOnOk}
            />
          ),
          showModal: true,
        };
      case ModalAction.CLOSE_MODAL:
      default:
        setModalFormData(null);
        return {
          content: null,
          showModal: false,
        };
    }
  };

  const deleteOperation = useMutation(
    (op: OperationType): any => {
      return dataManager.deleteOperation(op);
    },
    {
      onSuccess: (op: OperationType) => {
        showSuccesNotification('operationDeleted', t, { operation: op.name });
        refetch();
      },
      onError: (e) => {
        console.error(e);
        showErrorNotification(e, t);
      },
    }
  );

  const [modalState, modalDispatch] = useReducer(modalReducer, {
    content: null,
    showModal: false,
  });

  const columns: ColumnsType<OperationType> = [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (value) => (
        <Tooltip placement="bottomLeft" title={value}>
          {value}
        </Tooltip>
      ),
    },
    {
      key: 'name',
      title: t('name'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value) => (
        <Tooltip placement="bottomLeft" title={value}>
          {value}
        </Tooltip>
      ),
    },
    {
      key: 'limitDrive',
      title: 'Limit Drive',
      dataIndex: 'limitDrive',
      sorter: (a: any, b: any) => {
        if (!a.limitDrive && !b.limitDrive) return 0;
        if (!a.limitDrive) return -1;
        if (!b.limitDrive) return 1;
        return Number(a.limitDrive) - Number(b.limitDrive);
      },
      render: (value) => (
        <Tooltip placement="bottomLeft" title={value}>
          {getGeneralSize(value)}
        </Tooltip>
      ),
    },
    {
      key: 'limitUser',
      title: 'Limit Utilisateurs',
      dataIndex: 'limitUser',
      sorter: (a: any, b: any) => {
        if (!a.limitUser && !b.limitUser) return 0;
        if (!a.limitUser) return -1;
        if (!b.limitUser) return 1;
        return Number(a.limitUser) - Number(b.limitUser);
      },
      render: (value) => (
        <Tooltip placement="bottomLeft" title={value}>
          {value}
        </Tooltip>
      ),
    },
    {
      key: 'limitOperation',
      title: 'Limit Operations',
      dataIndex: 'limitOperation',
      sorter: (a: any, b: any) => {
        if (!a.limitOperation && !b.limitOperation) return 0;
        if (!a.limitOperation) return -1;
        if (!b.limitOperation) return 1;
        return Number(a.limitOperation) - Number(b.limitOperation);
      },
      render: (value) => (
        <Tooltip placement="bottomLeft" title={value}>
          {value}
        </Tooltip>
      ),
    },
    {
      key: 'modules',
      title: 'Modules',
      dataIndex: 'modules',
      render: (values) => (
        <>
          {values.map((value: any) => <>{value.name} <br /> </>)}
        </>
      ),
    },
    {
      key: 'createdAt',
      title: t('createdAt'),
      dataIndex: 'createdAt',
      responsive: ['md'],
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: getFormattedDate,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, record) => (
        <>
          {isAuthorized(OperationAction.MODIFY_OPERATION) && (
            <EditOutlined
              className="edit"
              onClick={() => {
                modalDispatch({
                  type: Action.MODIFY_OPERATION,
                  operation: record,
                });
              }}
            />
          )}
          {isAuthorized(OperationAction.DELETE_OPERATION) && (
            <Popconfirm
              title={t('confirm.title')}
              okText={t('confirm.ok')}
              cancelText={t('confirm.cancel')}
              onConfirm={() => deleteOperation.mutate(record)}
            >
              <DeleteOutlined className="delete" />
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  const hideModal = () => {
    modalDispatch({
      type: ModalAction.CLOSE_MODAL,
    });
  };

  const createOperation = useMutation(
    (): any => {
      return dataManager.createOperation({
        name: modalFormData.operationName,
        modules: modalFormData.modules,
        limitDrive: modalFormData.limitDrive,
        limitUser: modalFormData.limitUser,
        limitOperation: modalFormData.limitOperation,
      });
    },
    {
      onSuccess: () => {
        showSuccesNotification('operationCreated', t, {
          operation: modalFormData.operationName,
        });
        refetch();
      },
      onError: (e) => {
        console.error(e);
        showErrorNotification(e, t);
      },
    }
  );

  const editOperation = useMutation(
    (): any => {
      const { operationName, modules, limitDrive, limitOperation, limitUser } = modalFormData;
      return dataManager.updateOperation(modalState.selectedOperation.id, {
        name: operationName,
        modules,
        limitDrive,
        limitOperation,
        limitUser,
      });
    },
    {
      onSuccess: () => {
        showSuccesNotification('operationUpdated', t, {
          operation: modalFormData.operationName,
        });
        refetch();
      },
      onError: (e) => {
        console.error(e);
        showErrorNotification(e, t);
      },
    }
  );

  const items: MenuProps['items'] = [];
  if (isAuthorized(OperationAction.CREATE_OPERATION)) {
    items.push({
      label: (
        <div
          onClick={() => {
            modalDispatch({
              type: Action.CREATE_OPERATION,
            });
          }}
        >
          <AppstoreAddOutlined />
          {t('operation.new')}
        </div>
      ),
      key: 'new_op',
    });
  }

  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)
  useEffect(() => {
    if (operations) {
      setIsLoadingInitialData(false);
    }
  }, [operations]);

  return (
    <TableView
      title={t('admin.operationsTab')}
      data={operations}
      isFetching={isLoadingInitialData}
      actionsItems={items}
      columns={columns}
      formData={modalFormData}
      setFormData={setModalFormData}
      modalOnOkHandler={modalOnOk}
      hideModalHandler={hideModal}
      showModal={modalState.showModal}
      modalContent={modalState.content}
      minusTabSize={inTab}
    />
  );
};

export default withTranslation(withDataManager(OperationsPage));
