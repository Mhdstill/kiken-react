import React, { FC, useEffect, useReducer, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormInstance, Popconfirm, Tooltip } from 'antd';
import {
    AppstoreAddOutlined,
    DeleteOutlined,
    EditOutlined,
    StarOutlined,
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
import PointerField, { FieldType, FieldTypeMapping, FieldTypeStringMapping, getTypeString } from '../../types/PointerField';
import { CustomColumnsType } from '../../types/CustomColumnsType';

interface PointerFieldType extends PointerField {
    key: React.Key;
}

const PointerFieldsPage: FC<
    WithTranslation & WithDataManagerProps & { inTab?: boolean }
> = ({ dataManager, t, inTab }) => {
    const getFields = async () => {
        const fields = await dataManager.getFields();
        return fields.map((field, i) => {
            return Object.assign(field, { key: i });
        });
    };

    const FieldTypeOptions = Object.entries(FieldType)
        .filter(([key, value]) => !isNaN(Number(value))) // Filtrer pour obtenir uniquement les clés numériques
        .map(([key, value]) => ({
            id: value as FieldType, // Utiliser la valeur numérique
            label: FieldTypeStringMapping[value as FieldType] // Utiliser cette valeur pour obtenir l'étiquette en français
        }));

    const {
        data: fields,
        isFetching,
        refetch,
    } = useQuery(['fields'], getFields, {
        onError: (e) => {
            console.error(e);
        },
        refetchOnWindowFocus: false,
        refetchInterval: 1000,
        refetchIntervalInBackground: true,
    });

    const [modalFormData, setModalFormData] = useState<any | null>(null);
    const handleFormValues = (changedValues: any, allValues: any) => {
        console.log("Form Values Changed:", changedValues);
        console.log("All Form Values:", allValues);
        setModalFormData(allValues);
    };

    const modalOnOk = async (form?: FormInstance) => {
        const formData = form?.getFieldsValue();
        if (modalState.action && (modalFormData || formData)) {
            switch (modalState.action) {
                case Action.CREATE_POINTER_FIELD:
                    createField.mutate();
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
                    },
                    {
                        name: 'pointerFieldAllways',
                        type: 'checkbox',
                    },
                    {
                        name: 'pointerFieldRequired',
                        type: 'checkbox',
                    },
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

                const modifyInputs: any = [
                    { name: 'pointerFieldName', value: action.field.label },
                    {
                        name: 'pointerFieldType',
                        possibleValues: FieldTypeOptions,
                        multiple: false,
                        value: action.field.type
                    }
                ];

                if (!action.field.isUnique) {
                    modifyInputs.push(
                        {
                            name: 'pointerFieldAllways',
                            type: 'checkbox',
                            value: action.field.allwaysFill
                        },
                        {
                            name: 'pointerFieldRequired',
                            type: 'checkbox',
                            value: action.field.isRequired
                        }
                    );
                }
                return {
                    action: Action.MODIFY_POINTER_FIELD,
                    selectedPointerField: action.field,
                    content: (
                        <ModalForm
                            inputs={modifyInputs}
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

    const deleteField = useMutation(
        (field: PointerField): any => {
            return dataManager.deleteField(field);
        },
        {
            onSuccess: (field: PointerField) => {
                showSuccesNotification('pointerFieldDeleted', t, { field: field.label });
                refetch();
            },
            onError: (e) => {
                console.error(e);
                showErrorNotification(e, t);
            },
        }
    );

    const columns: CustomColumnsType<PointerFieldType> = [
        {
            key: 'label',
            title: 'Nom du champs',
            dataIndex: 'label',
            ellipsis: {
                showTitle: false,
            },
            sorter: (a, b) => a.label.localeCompare(b.label),
            render: (value, record) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {record.isUnique && (
                        <StarOutlined className="me-2" style={{ position: "relative", top: "-3px" }} />
                    )}
                    {value}
                </Tooltip>
            ),
            useFilter: true
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
            useFilter: true,
        },
        {
            key: 'allwaysFill',
            title: t('form.pointerFieldAllways'),
            dataIndex: 'allwaysFill',
            ellipsis: {
                showTitle: false,
            },
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value ? "Oui" : "Non"}
                </Tooltip>
            ),
        },
        {
            key: 'isRequired',
            title: t('form.pointerFieldRequired'),
            dataIndex: 'isRequired',
            ellipsis: {
                showTitle: false,
            },
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value ? "Oui" : "Non"}
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
                    {!record.isUnique && (
                        <Popconfirm
                            title={t('confirm.title')}
                            okText={t('confirm.ok')}
                            cancelText={t('confirm.cancel')}
                            onConfirm={() => deleteField.mutate(record)}
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

    const createField = useMutation(
        (): any => {
            const { pointerFieldName, pointerFieldType, pointerFieldAllways, pointerFieldRequired } = modalFormData;
            return dataManager.createField({
                'label': pointerFieldName,
                'type': pointerFieldType,
                'allwaysFill': pointerFieldAllways,
                'isRequired': pointerFieldRequired
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
            const { pointerFieldName, pointerFieldType, pointerFieldAllways, pointerFieldRequired } = modalFormData;
            console.log(pointerFieldAllways);
            return dataManager.updateField(modalState.selectedPointerField, {
                'label': pointerFieldName,
                'type': pointerFieldType,
                'allwaysFill': pointerFieldAllways,
                'isRequired': pointerFieldRequired
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

    //Reload data
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)
    useEffect(() => {
        if (fields) {
            setIsLoadingInitialData(false);
        }
    }, [fields]);

    return (
        <TableView
            title={t('admin.pointerFieldTabs')}
            data={fields}
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

export default withTranslation(withDataManager(PointerFieldsPage));
