import React, { FC, useEffect, useReducer, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormInstance, MenuProps, Popconfirm, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, QrcodeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import type { WithTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
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
import ClockIn from '../../types/ClockIn';

interface PointerType extends Pointer {
    key: React.Key;
}
const PointersPage: FC<
    WithTranslation & WithDataManagerProps & { inTab?: boolean }
> = ({ dataManager, t, inTab }) => {


    const [modalFormData, setModalFormData] = useState<any | null>(null);
    const params = useParams();
    const { operation_token } = sessionStorage;
    const clockInURL = `${window.location.origin}/${operation_token}/form`;
      

    // Fill Table Datas
    const getClockIns = async () => {
        const ops: ClockIn[] = await dataManager.getClockIns();
        return ops.map((op, i) => {
            const opWithAdditionalFields: any = { ...op };

            if (op.fieldValues && op.fieldValues.length >= 1) {
                op.fieldValues.forEach(fieldValue => {
                    const label = fieldValue.custom_field.label;
                    const value = fieldValue.value;
                    opWithAdditionalFields[label] = value;
                });
            }

            if (op.clockInEmployee && op.clockInEmployee.fieldValues.length >= 1) {
                op.clockInEmployee.fieldValues.forEach(employeeFieldValue => {
                    const label = employeeFieldValue.custom_field.label;
                    const value = employeeFieldValue.value;
                    opWithAdditionalFields[label] = value;
                });
            }

            return { ...opWithAdditionalFields, key: i };
        });
    };
    const {
        data: clockIns,
        isFetching,
        refetch,
    } = useQuery(['clockIns'], getClockIns, {
        onError: (e) => {
            console.error(e);
        },
        refetchOnWindowFocus: false,
        refetchInterval: 1000,
        refetchIntervalInBackground: true,
    });







    // Columns
    const buildDynamicColumns = (clockInsData: ClockIn[]) => {
        const dynamicColumns = new Set<string>();
        clockInsData.forEach(clockIn => {
            // Vérifiez si fieldValues existe avant de les itérer
            console.log(clockIn);
            if (clockIn.fieldValues) {
                clockIn.fieldValues.forEach(fieldValue => {
                    dynamicColumns.add(fieldValue.custom_field.label);
                });
            }

            // Vérifiez également pour clockInEmployee et ses fieldValues
            if (clockIn.clockInEmployee && clockIn.clockInEmployee.fieldValues) {
                clockIn.clockInEmployee.fieldValues.forEach(employeeFieldValue => {
                    dynamicColumns.add(employeeFieldValue.custom_field.label);
                });
            }
        });
        console.log(dynamicColumns);

        return Array.from(dynamicColumns).map(label => ({
            key: label,
            title: label,
            dataIndex: label,
            render: (value: any) => <Tooltip placement="bottomLeft" title={value}>{value}</Tooltip>
        }));
    };

    const baseColumns: ColumnsType<any> = [
        {
            key: 'start',
            title: 'Date',
            dataIndex: 'start',
            responsive: ['md'],
            sorter: (a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime(),
            defaultSortOrder: 'descend',
            render: getFormattedDate,
        },
    ];
    const dynamicColumns = buildDynamicColumns(clockIns || []);
    const columns = [...dynamicColumns, ...baseColumns];




    // Actions
    const modalReducer = (prevState: any, action: any) => {
        switch (action.type) {
            case Action.SHOW_POINTER_QR:
                return {
                    action: Action.SHOW_POINTER_QR,
                    content: (
                        <a href={clockInURL} target="_blank" rel="noopener noreferrer">
                            <QRCodeCanvas
                                id="qrcode"
                                value={action.qrCodeValue}
                            />
                        </a>
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
    const hideModal = () => {
        modalDispatch({
            type: ModalAction.CLOSE_MODAL,
        });
    };
    const items: MenuProps['items'] = [];
    if (isAuthorized(Action.SHOW_POINTER_QR)) {
        items.push({
            label: (
                <div
                    onClick={() => {
                        modalDispatch({
                            type: Action.SHOW_POINTER_QR,
                            qrCodeValue: clockInURL,
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

    //Reload data
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)
    useEffect(() => {
        if (clockIns) {
          setIsLoadingInitialData(false);
        }
      }, [clockIns]);


    return (
        <TableView
            title={t('admin.pointersTab')}
            data={clockIns}
            isFetching={isLoadingInitialData}
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
