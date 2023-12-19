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
import { PointerAction as Action } from '../../services/auth/auth';

import '../../style.less';
import PointerField, { FieldType, FieldTypeMapping, getFieldTypeFromLabel, getTypeString } from '../../types/PointerField';

interface PointerFieldType extends PointerField {
    key: React.Key;
}

const PointerFieldsPage: FC<
    WithTranslation & WithDataManagerProps & { inTab?: boolean }
> = ({ dataManager, t, inTab }) => {
    const getPointerFields = async () => {
        const fields = await dataManager.getPointerFields();
        return fields.map((field, i) => {
            return Object.assign(field, { key: i });
        });
    };

    const FieldTypeOptions = Object.entries(FieldType)
        .filter(([key, value]) => !isNaN(Number(value))) // Filtrer pour obtenir uniquement les clés numériques
        .map(([key, value]) => ({
            id: value as FieldType, // Utiliser la valeur numérique
            label: FieldTypeMapping[value as FieldType] // Utiliser cette valeur pour obtenir l'étiquette en français
        }));

    const {
        data: fields,
        isFetching,
        refetch,
    } = useQuery(['fields'], getPointerFields, {
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
                case Action.CREATE_POINTER_FIELD:
                    createPointerField.mutate();
                    refetch();
                    break;
                case Action.MODIFY_POINTER_FIELD:
                    editPointerField.mutate();
                    refetch();
                    break;
            }
        }
        hideModal();
    };

    const modalReducer = (prevState: any, action: any) => {
        switch (action.type) {
            case Action.CREATE_POINTER_FIELD:
                const inputs: any[] = [
                    { name: 'pointerFieldName' },
                    {
                        name: 'pointerFieldType',
                        possibleValues: FieldTypeOptions,
                        multiple: false,
                    }
                ];
                return {
                    action: Action.CREATE_POINTER_FIELD,
                    content: (
                        <ModalForm
                            inputs={inputs}
                            onFormValueChange={handleFormValues}
                            submit={modalOnOk}
                        />
                    ),
                    showModal: true,
                };
            case Action.MODIFY_POINTER_FIELD:
                console.log(action);
                return {
                    action: Action.MODIFY_POINTER_FIELD,
                    selectedPointerField: action.field,
                    content: (
                        <ModalForm
                            inputs={[
                                { name: 'pointerFieldName', value: action.field.label },
                                {
                                    name: 'pointerFieldType',
                                    possibleValues: FieldTypeOptions,
                                    multiple: false,
                                    value: action.field.type
                                }
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

    const deletePointerField = useMutation(
        (field: PointerField): any => {
            return dataManager.deletePointerField(field);
        },
        {
            onSuccess: (field: PointerField) => {
                showSuccesNotification('pointerFieldCreated', t, { field: field.label });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const columns: ColumnsType<PointerFieldType> = [
        {
            key: 'label',
            title: 'Nom du champs',
            dataIndex: 'label',
            ellipsis: {
                showTitle: false,
            },
            sorter: (a, b) => a.label.localeCompare(b.label),
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value}
                </Tooltip>
            ),
        },
        {
            key: 'type',
            title: 'Type de champs',
            dataIndex: 'type',
            ellipsis: {
                showTitle: false,
            },
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {getTypeString(value)}
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
                                type: Action.MODIFY_POINTER_FIELD,
                                field: record,
                            });
                        }}
                    />
                    <Popconfirm
                        title={t('confirm.title')}
                        okText={t('confirm.ok')}
                        cancelText={t('confirm.cancel')}
                        onConfirm={() => deletePointerField.mutate(record)}
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

    const createPointerField = useMutation(
        (): any => {
            const { pointerFieldName, pointerFieldType } = modalFormData;
            return dataManager.createPointerField({
                'label': pointerFieldName,
                'type': pointerFieldType,
            });
        },
        {
            onSuccess: () => {
                showSuccesNotification('pointerFieldCreated', t, { field: modalFormData.pointerFieldName });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const editPointerField = useMutation(
        (): any => {
            const { pointerFieldName, pointerFieldType } = modalFormData;
            return dataManager.updatePointerField(modalState.selectedPointerField, {
                'label': pointerFieldName,
                'type': pointerFieldType,
            });
        },
        {
            onSuccess: () => {
                showSuccesNotification('pointerFieldUpdated', t, { field: modalFormData.pointerFieldName });
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
                        type: Action.CREATE_POINTER_FIELD,
                    });
                }}
            >
                <AppstoreAddOutlined />
                {t('field.new')}
            </div>
        ),
        key: 'new_pointer_field',
    });

    return (
        <TableView
            title={t('admin.pointerFieldTabs')}
            data={fields}
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

export default withTranslation(withDataManager(PointerFieldsPage));
