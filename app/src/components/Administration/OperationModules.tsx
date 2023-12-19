import React, { FC, useReducer, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormInstance, Popconfirm, Tooltip } from 'antd';
import {
    AppstoreAddOutlined,
    DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import type { WithTranslation } from 'react-i18next';

import TableView from '../TableView';
import ModalForm from '../Modal/ModalForm';
import withDataManager, {
    WithDataManagerProps,
} from '../../hoc/withDataManager';
import withTranslation from '../../hoc/withTranslation';
import {
    isAuthorized,
    ModalAction,
    Role,
} from '../../services/auth/auth';
import {
    getFormattedDate,
    showErrorNotification,
    showSuccesNotification,
} from '../../services/utils';
import { ModuleAction as Action } from '../../services/auth/auth';
import type Module from '../../types/Module';

import '../../style.less';

interface ModuleType extends Module {
    key: React.Key;
}

const OperationModulesPage: FC<
    WithTranslation & WithDataManagerProps & { inTab?: boolean }
> = ({ dataManager, t, inTab }) => {
    const getModules = async () => {
        const modules = await dataManager.getModules();
        return modules.map((module, i) => {
            return Object.assign(module, { key: i });
        });
    };

    const {
        data: modules,
        isFetching,
        refetch,
    } = useQuery(['modules'], getModules, {
        onError: (e) => {
            console.error(e);
        },
        refetchOnWindowFocus: false,
    });

    const [modalFormData, setModalFormData] = useState<any | null>(null);
    const handleFormValues = (changedValues: any, allValues: any) => {
        setModalFormData(allValues);
    };

    const modalOnOk = async (form?: FormInstance) => {
        const formData = form?.getFieldsValue();
        if (modalState.action && (modalFormData || formData)) {
            switch (modalState.action) {
                case Action.CREATE_MODULE:
                    createModule.mutate();
                    refetch();
                    break;
                case Action.MODIFY_MODULE:
                    editModule.mutate();
                    refetch();
                    break;
            }
        }
        hideModal();
    };

    const modalReducer = (prevState: any, action: any) => {
        switch (action.type) {
            case Action.CREATE_MODULE:
                const inputs: any[] = [{ name: 'name' }, { name: 'code' }];
                return {
                    action: Action.CREATE_MODULE,
                    content: (
                        <ModalForm
                            inputs={inputs}
                            onFormValueChange={handleFormValues}
                            submit={modalOnOk}
                        />
                    ),
                    showModal: true,
                };
            case Action.MODIFY_MODULE:
                return {
                    action: Action.MODIFY_MODULE,
                    selectedModule: action.module,
                    content: (
                        <ModalForm
                            inputs={[
                                { name: 'name', value: action.module.name },
                                { name: 'code', value: action.module.code },
                            ]}
                            onFormValueChange={handleFormValues}
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

    const [modalState, modalDispatch] = useReducer(modalReducer, {
        content: null,
        showModal: false,
    });

    const deleteModule = useMutation(
        (module: Module): any => {
            return dataManager.deleteModule(module);
        },
        {
            onSuccess: (module: Module) => {
                showSuccesNotification('moduleDeleted', t, { module: module.name });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const columns: ColumnsType<ModuleType> = [
        {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            ellipsis: {
                showTitle: false,
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value}
                </Tooltip>
            ),
        },
        {
            key: 'code',
            title: 'Code',
            dataIndex: 'code',
            ellipsis: {
                showTitle: false,
            },
            sorter: (a, b) => a.code.localeCompare(b.code),
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value}
                </Tooltip>
            ),
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (value, record) => (
                <>
                    <EditOutlined
                        className="edit"
                        onClick={() => {
                            modalDispatch({
                                type: Action.MODIFY_MODULE,
                                module: record,
                            });
                        }}
                    />
                    <Popconfirm
                        title={t('confirm.title')}
                        okText={t('confirm.ok')}
                        cancelText={t('confirm.cancel')}
                        onConfirm={() => deleteModule.mutate(record)}
                    >
                        <DeleteOutlined className="delete" />
                    </Popconfirm>
                </>
            ),
        },
    ];

    const hideModal = () => {
        modalDispatch({
            type: ModalAction.CLOSE_MODAL,
        });
    };

    const createModule = useMutation(
        (): any => {
            const { name, code } = modalFormData;
            return dataManager.createModule({
                name,
                code,
            });
        },
        {
            onSuccess: () => {
                showSuccesNotification('moduleCreated', t, { module: modalFormData.name });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const editModule = useMutation(
        (): any => {
            const { name, code } = modalFormData;
            return dataManager.updateModule(modalState.selectedModule, {
                name,
                code,
            });
        },
        {
            onSuccess: () => {
                showSuccesNotification('moduleUpdated', t, { module: modalFormData.name });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const items: MenuProps['items'] = [];
    items.push({
        label: (
            <div
                onClick={() => {
                    modalDispatch({
                        type: Action.CREATE_MODULE,
                    });
                }}
            >
                <AppstoreAddOutlined />
                {t('module.new')}
            </div>
        ),
        key: 'new_module',
    });

    return (
        <TableView
            title={t('admin.modulesTab')}
            data={modules}
            isFetching={isFetching}
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

export default withTranslation(withDataManager(OperationModulesPage));
