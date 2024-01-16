import React, { FC, useEffect, useReducer, useState } from 'react';
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
import { UpdateAction as Action } from '../../services/auth/auth';
import type Update from '../../types/Update';

import '../../style.less';

interface UpdateType extends Update {
    key: React.Key;
}

const UpdatePage: FC<
    WithTranslation & WithDataManagerProps & { inTab?: boolean }
> = ({ dataManager, t, inTab }) => {
    const getUpdates = async () => {
        const updates = await dataManager.getUpdates();
        return updates.map((updates, i) => {
            return Object.assign(updates, { key: i });
        });
    };

    const {
        data: updates,
        isFetching,
        refetch,
    } = useQuery(['updates'], getUpdates, {
        onError: (e) => {
            console.error(e);
        },
        refetchOnWindowFocus: false,
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });

    const formatTextAreaContent = (text: any) => {
        return text.split('\n').map((line: any, index: any) => <span key={index}>{line}<br /></span>);
    }

    const [modalFormData, setModalFormData] = useState<any | null>(null);
    const handleFormValues = (changedValues: any, allValues: any) => {
        setModalFormData(allValues);
    };

    const modalOnOk = async (form?: FormInstance) => {
        const formData = form?.getFieldsValue();
        if (modalState.action && (modalFormData || formData)) {
            switch (modalState.action) {
                case Action.CREATE_UPDATE:
                    createUpdate.mutate();
                    refetch();
                    break;
                case Action.MODIFY_UPDATE:
                    editUpdate.mutate();
                    refetch();
                    break;
            }
        }
        hideModal();
    };

    const modalReducer = (prevState: any, action: any) => {
        switch (action.type) {
            case Action.CREATE_UPDATE:
                const inputs: any[] = [{ name: 'version' }, { name: 'content', type: 'text' }];
                return {
                    action: Action.CREATE_UPDATE,
                    content: (
                        <ModalForm
                            inputs={inputs}
                            onFormValueChange={handleFormValues}
                            submit={modalOnOk}
                        />
                    ),
                    showModal: true,
                };
            case Action.MODIFY_UPDATE:
                return {
                    action: Action.MODIFY_UPDATE,
                    selectedUpdate: action.update,
                    content: (
                        <ModalForm
                            inputs={[
                                { name: 'version', value: action.update.version },
                                { name: 'content', type: 'text', value: action.update.content },
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

    const deleteUpdate = useMutation(
        (update: Update): any => {
            return dataManager.deleteUpdate(update);
        },
        {
            onSuccess: (update: Update) => {
                showSuccesNotification('updateDeleted', t, { update: update.version });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const columns: ColumnsType<UpdateType> = [
        {
            key: 'version',
            title: 'Version',
            dataIndex: 'version',
            ellipsis: {
                showTitle: false,
            },
            align: 'center',
            sorter: (a, b) => a.version.localeCompare(b.version),
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value}
                </Tooltip>
            ),
        },
        {
            key: 'content',
            title: 'Contenu',
            dataIndex: 'content',
            ellipsis: {
                showTitle: false,
            },
            sorter: (a, b) => a.content.localeCompare(b.content),
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {formatTextAreaContent(value)}
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
                                type: Action.MODIFY_UPDATE,
                                update: record,
                            });
                        }}
                    />
                    <Popconfirm
                        title={t('confirm.title')}
                        okText={t('confirm.ok')}
                        cancelText={t('confirm.cancel')}
                        onConfirm={() => deleteUpdate.mutate(record)}
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

    const createUpdate = useMutation(
        (): any => {
            const { version, content } = modalFormData;
            return dataManager.createUpdate({
                version,
                content,
            });
        },
        {
            onSuccess: () => {
                showSuccesNotification('updateCreated', t, { update: modalFormData.version });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const editUpdate = useMutation(
        (): any => {
            const { version, content } = modalFormData;
            return dataManager.updateUpdate(modalState.selectedUpdate, {
                version,
                content,
            });
        },
        {
            onSuccess: () => {
                showSuccesNotification('updateUpdated', t, { update: modalFormData.version });
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
                        type: Action.CREATE_UPDATE,
                    });
                }}
            >
                <AppstoreAddOutlined />
                Nouvelle mise à jour
            </div>
        ),
        key: 'new_update',
    });

    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)
    useEffect(() => {
        if (updates) {
            setIsLoadingInitialData(false);
        }
    }, [updates]);




    return (
        <TableView
            title={t('admin.updateTab')}
            data={updates}
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

export default withTranslation(withDataManager(UpdatePage));
