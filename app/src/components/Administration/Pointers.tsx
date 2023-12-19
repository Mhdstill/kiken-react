import React, { FC, useReducer, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormInstance, MenuProps, Popconfirm, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, QrcodeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import type { WithTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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
    UserAction,
} from '../../services/auth/auth';
import { PointerAction as Action } from '../../services/auth/auth';
import type Pointer from '../../types/Pointer';

import '../../style.less';
import { QRCodeCanvas } from 'qrcode.react';

interface PointerType extends Pointer {
    key: React.Key;
}
const PointersPage: FC<
    WithTranslation & WithDataManagerProps & { inTab?: boolean }
> = ({ dataManager, t, inTab }) => {
    const getPointers = async () => {
        const ops = await dataManager.getPointers();
        return ops.map((op, i) => {
            op.email = op.person.email;
            op.societe = op.person.societe;
            return Object.assign(op, { key: i });
        });
    };

    const {
        data: pointers,
        isFetching,
        refetch,
    } = useQuery(['pointers'], getPointers, {
        onError: (e) => {
            console.error(e);
        },
        refetchOnWindowFocus: false,
    });

    const [modalFormData, setModalFormData] = useState<any | null>(null);
    const params = useParams();
    const { operation_token } = sessionStorage;
    const handleFormValues = (changedValues: any, allValues: any) => {
        setModalFormData(allValues);
    };

    const modalReducer = (prevState: any, action: any) => {
        switch (action.type) {
            case Action.SHOW_POINTER_QR:
                return {
                    action: Action.SHOW_POINTER_QR,
                    content: (
                        <QRCodeCanvas
                            id="qrcode"
                            value={action.qrCodeValue}
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
                    content: null,
                    showModal: false,
                };
        }
    };

    const [modalState, modalDispatch] = useReducer(modalReducer, {
        content: null,
        showModal: false,
    });

    const columns: ColumnsType<Pointer> = [
        {
            key: 'email',
            title: 'Email',
            dataIndex: 'email',
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value}
                </Tooltip>
            ),
        },
        {
            key: 'societe',
            title: t('society'),
            dataIndex: 'societe',
            render: (value) => (
                <Tooltip placement="bottomLeft" title={value}>
                    {value}
                </Tooltip>
            ),
        },
        {
            key: 'start',
            title: t('start'),
            dataIndex: 'start',
            responsive: ['md'],
            sorter: (a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime(),
            defaultSortOrder: 'descend',
            render: getFormattedDate,
        },
        {
            key: 'end',
            title: t('end'),
            dataIndex: 'end',
            responsive: ['md'],
            sorter: (a, b) => {
                if (a.end && b.end) {
                    return new Date(a.end).getTime() - new Date(b.end).getTime();
                }
                return 0;
            },
            defaultSortOrder: 'descend',
            render: (value) => {
                if (value) {
                    return getFormattedDate(value);
                }
                return '-';
            },
        },
    ];

    const hideModal = () => {
        modalDispatch({
            type: ModalAction.CLOSE_MODAL,
        });
    };

    const createOperation = useMutation(
        (): any => {
            return dataManager.createOperation(modalFormData.operationName);
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

    const items: MenuProps['items'] = [];
    if (isAuthorized(UserAction.CREATE_USER)) {
        items.push({
            label: (
                <div
                    onClick={() => {
                        modalDispatch({
                            type: Action.SHOW_POINTER_QR,
                            qrCodeValue: `${window.location.origin}/${operation_token}/pointer`,
                            onOk: () => {
                                const canvas = document.getElementById('qrcode') as HTMLCanvasElement;
                                if (canvas) {
                                    const url = canvas.toDataURL('image/png');
                                    const link = document.createElement('a');
                                    link.download = `pointer.png`;
                                    link.href = url;
                                    link.click();
                                }
                            },
                            okText: t('modal.download'),
                        });
                    }}
                >
                    <QrcodeOutlined />
                    QR Code
                </div>
            ),
            key: 'new_op',
        });
    }

    return (
        <TableView
            title={t('admin.pointersTab')}
            data={pointers}
            isFetching={isFetching}
            actionsItems={items}
            columns={columns}
            formData={modalFormData}
            setFormData={setModalFormData}
            modalOnOkHandler={modalState.onOk}
            hideModalHandler={hideModal}
            showModal={modalState.showModal}
            modalContent={modalState.content}
            minusTabSize={inTab}
            okText={modalState.okText}
        />
    );
};

export default withTranslation(withDataManager(PointersPage));
