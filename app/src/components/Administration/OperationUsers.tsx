import React, { FC, useEffect, useReducer, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormInstance, Popconfirm, Tooltip } from 'antd';
import {
    EditOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
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
    OperationAction,
    Role,
} from '../../services/auth/auth';
import {
    getFormattedDate,
    showErrorNotification,
    showSuccesNotification,
} from '../../services/utils';
import type User from '../../types/User';
import { UserAction as Action } from '../../services/auth/auth';
import '../../style.less';
import Operation from '../../types/Operation';

interface UserType extends User {
    key: React.Key;
}

const OperationUsersPage: FC<
    WithTranslation & WithDataManagerProps & { inTab?: boolean }
> = ({ dataManager, t, inTab }) => {
    const getClients = async () => {
        const users = await dataManager.getClients();
        return users.map((user, i) => {
            user.operation = user.operations.map((op: Operation) => (<> {op.name} <br /> </>))
            return Object.assign(user, { key: i });
        });
    };

    const {
        data: users,
        isFetching,
        refetch,
    } = useQuery(['users'], getClients, {
        onError: (e) => {
            console.error(e);
        },
        refetchOnWindowFocus: false,
        refetchInterval: 4000,
        refetchIntervalInBackground: true,
    });

    const role = sessionStorage.getItem('role');

    const getOperations = async () => {
        const ops = await dataManager.getOperations();
        return ops.map((op, i) => {
            return Object.assign(op, { key: i });
        });
        return null;
    };

    const { data: operations } = useQuery(['operations'], getOperations, {
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
                case Action.CREATE_USER:
                    createUser.mutate();
                    refetch();
                    break;
                case Action.MODIFY_USER:
                    editUser.mutate();
                    refetch();
                    break;
            }
        }
        hideModal();
    };

    const modalReducer = (prevState: any, action: any) => {
        switch (action.type) {
            case Action.CREATE_USER:
                const inputs: any[] = [{ name: 'email' }, { name: 'password' }];
                inputs.push({
                    name: 'userOperations',
                    possibleValues: operations
                        ? operations.map((op) => ({
                            id: op['@id'],
                            label: op.name,
                        }))
                        : [],
                    multiple: true,
                });
                return {
                    action: Action.CREATE_USER,
                    content: (
                        <ModalForm
                            inputs={inputs}
                            onFormValueChange={handleFormValues}
                            submit={modalOnOk}
                        />
                    ),
                    showModal: true,
                };
            case Action.MODIFY_USER:
                return {
                    action: Action.MODIFY_USER,
                    selectedUser: action.user,
                    content: (
                        <ModalForm
                            inputs={[
                                { name: 'email', value: action.user.email },
                                { name: 'password' },
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

    const deleteUser = useMutation(
        (user: UserType): any => {
            return dataManager.deleteUser(user);
        },
        {
            onSuccess: (user: UserType) => {
                showSuccesNotification('userDeleted', t, { user: user.email });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const columns: ColumnsType<UserType> = [
        {
            key: 'email',
            title: 'Email',
            dataIndex: 'email',
            ellipsis: {
                showTitle: false,
            },
            sorter: (a, b) => a.email.localeCompare(b.email),
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value}
                </Tooltip>
            ),
        },
        {
            key: 'operation',
            title: 'Opération',
            dataIndex: 'operation',
            ellipsis: {
                showTitle: false,
            },
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value}
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
                                    type: Action.MODIFY_USER,
                                    user: record,
                                });
                            }}
                        />
                    )}
                    {isAuthorized(OperationAction.DELETE_OPERATION) && (
                        <Popconfirm
                            title={t('confirm.title')}
                            okText={t('confirm.ok')}
                            cancelText={t('confirm.cancel')}
                            onConfirm={() => deleteUser.mutate(record)}
                        >
                            <UserDeleteOutlined className="delete" />
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

    const createUser = useMutation(
        (): any => {
            const { email, password, userOperations } = modalFormData;
            console.log(userOperations);
            return dataManager.createUser({
                email,
                password,
                operations: userOperations
            });
        },
        {
            onSuccess: () => {
                showSuccesNotification('userCreated', t, { user: modalFormData.email });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const editUser = useMutation(
        (): any => {
            const { email, password } = modalFormData;
            return dataManager.updateUser(modalState.selectedUser, {
                email,
                password,
            });
        },
        {
            onSuccess: () => {
                showSuccesNotification('userUpdated', t, { user: modalFormData.email });
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
                            type: Action.CREATE_USER,
                        });
                    }}
                >
                    <UserAddOutlined /> {t('user.new')}
                </div>
            ),
            key: 'new_user',
        });
    }

    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)
    useEffect(() => {
        if (users) {
            setIsLoadingInitialData(false);
        }
    }, [users]);

    return (
        <TableView
            title={t('admin.clientsTab')}
            data={users}
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

export default withTranslation(withDataManager(OperationUsersPage));
