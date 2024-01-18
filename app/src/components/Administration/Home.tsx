import React, { FC, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { WithTranslation } from 'react-i18next';
import withTranslation from '../../hoc/withTranslation';
import withDataManager, {
    WithDataManagerProps,
} from '../../hoc/withDataManager';
import './style.less';
import FormView, { FormViewSection } from '../FormView';
import { FileAction, PointerAction, isAuthorized } from '../../services/auth/auth';
import { IconKey, QR4YOU_ID, getExtension, getFormattedDate, getIcon, showSuccesNotification } from '../../services/utils';
import { API_URL } from '../../services/utils';
import { Avatar, Card, Col, List, Progress, Row, Space, Statistic, Table, Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { FileType, Type, getGeneralSize, getSize } from '../../types/File';
import Notification from '../../types/Notification';
import { ColumnsType } from 'antd/lib/table';
import { faArrowLeft, faEnvelope, faFile, faFilePdf, faFileWord, faFolder, faImage } from '@fortawesome/free-solid-svg-icons';
import { useOperation } from '../../contexts/OperationContext';

const AdminHomePage: FC = ({
    dataManager,
    t,
}: WithTranslation & WithDataManagerProps) => {

    const [folderId, setFolderId] = useState<string | null>(null);
    const { operations, operationToken } = useOperation();
    const formatTextAreaContent = (text: any) => {
        return text.split('\n').map((line: any, index: any) => <span key={index}>{line}<br /></span>);
    }

    const getOperation = async () => {
        if (!operationToken) {
            throw new Error("Pas de token d'opération disponible");
        }

        try {
            return await dataManager.getOperation(operationToken);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'opération :", error);
            throw error;
        }
    };
    const { data: operation, isFetching, refetch } = useQuery(['operations', operationToken], getOperation, {
        onError: (error) => {
            console.error("Erreur lors de la requête de l'opération :", error);
        },
        refetchOnWindowFocus: false,
        enabled: !!operationToken, // N'exécutez la requête que si operationToken existe
        refetchInterval: 4000, // Mise à jour toutes les 5 secondes
        refetchIntervalInBackground: true,
    });

    const getUpdates = async () => {
        try {
            return await dataManager.getUpdates();
        } catch (error) {
            console.error("Erreur lors de la récupération de l'opération :", error);
            throw error;
        }
    };
    const { data: updates, isFetching: updateFetching, refetch: updateRefetch } = useQuery(['updates'], getUpdates, {
        onError: (error) => {
            console.error("Erreur lors de la requête de l'opération :", error);
        },
        refetchOnWindowFocus: false,
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });

    const getRootFolder = async (operationToken: string) => {
        try {
            const response = await fetch(API_URL + `/api/${operationToken}/folders?root=true`);
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            return data['hydra:member'];
        } catch (err) {
            throw new Error(err.message);
        }
    }

    const getQR4YOUFolder = async () => {
        if (!operationToken) {
            return;
        }

        let folder;
        try {
            if (folderId) {
                folder = await dataManager.getFolder(operationToken, folderId);
            } else {
                folder = (await getRootFolder(QR4YOU_ID))[0];
            }
            let i = 1;
            console.log(folder);
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

    const { data: QR4YOUFolder, isFetching: isFetchingQR4YOUFolder, refetch: refetchQR4YOUFolder } = useQuery(['QR4YOUFolder'], getQR4YOUFolder, {
        onError: (error) => {
            console.error("Erreur lors de la requête de l'opération :", error);
        },
        refetchOnWindowFocus: false,
        refetchInterval: 40000,
        refetchIntervalInBackground: true,
    });
    const notifications = (operation && operation.notifications) ? operation.notifications : [];

    // Table handles
    const downloadFile = (file: FileType) => {
        if (!operationToken) {
            return;
        }
        dataManager
            .downloadFile(operationToken, file.id)
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                triggerDownload(file.name, url);
            })
            .catch(console.error);
    };

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
    useEffect(() => {
        refetchQR4YOUFolder();
    }, [folderId]);

    const getDocument = (record: any) => {


        const type = record['@type'];
        if (type === Type.FOLDER) {
            return (
                <a onClick={() => { setFolderId(record.id); }}>
                    <FontAwesomeIcon icon={faFolder} style={{ fontSize: "22px", color: "orange", position: "relative", top: "4px", }} className='me-2' />
                    {record.name}
                </a>
            );
        } else {

            let documentIcon = <FontAwesomeIcon icon={faFile} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;

            const extension = record['extension'];
            if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
                documentIcon = <FontAwesomeIcon icon={faImage} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;
            } else if (extension === 'pdf') {
                documentIcon = <FontAwesomeIcon icon={faFilePdf} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;
            } else if (extension === 'eml') {
                documentIcon = <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;
            } else if (extension === 'docx') {
                documentIcon = <FontAwesomeIcon icon={faFileWord} style={{ fontSize: "22px", color: "var(--main-color)", position: "relative", top: "4px" }} className='me-2' />;
            }

            return (
                <a onClick={() => downloadFile(record)}> {documentIcon} {record.name}</a>
            );
        }

    };

    const columns: ColumnsType<FileType> = [
        {
            key: 'name',
            title: (
                <>
                    {folderId && (
                        <FontAwesomeIcon className='me-4' icon={faArrowLeft} onClick={() => setFolderId(null)} />
                    )}
                    {t('name')}
                </>
            ),
            ellipsis: {
                showTitle: false,
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (value, record: any) => (
                <Tooltip placement="bottomLeft" title={record.name}>
                    {folderId && (
                        <></>
                    )}
                    {getDocument(record)}
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
            render: (value, record: any) => (
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

    const limitDrivePercent = (operation
        && operation.limitDrive && operation.limitDrive > 0
        && operation.size && operation.size > 0
    ) ? (operation.size / operation.limitDrive) * 100 : 0;
    const status = (limitDrivePercent && limitDrivePercent >= 90) ? "exception" : "success"

    return (
        <>
            <div className='row mb-3'>
                <div className='col-md-8 home-left'>

                    <div className='row mb-3'>
                        <div className='col-md-4'>
                            <Card bordered={false} className='c-card text-center p-1 mb-3'>
                                <h3 className="section-title">QR Drive</h3>
                                <Space wrap>
                                    <Progress type="circle" percent={limitDrivePercent} status={status} />
                                </Space>
                                <p style={{ fontWeight: 'bold', opacity: 0.8 }}> {operation && getSize(operation)} / {operation && getGeneralSize(operation.limitDrive)}</p>
                            </Card>
                        </div>
                        <div className='col-md-4'>
                            <Card bordered={false} className='c-card text-center p-1 mb-3'>
                                <h3 className="section-title">Opérations</h3>
                                <Space wrap>
                                    <Progress type="circle" percent={10} status="success" />
                                </Space>
                                <p style={{ fontWeight: 'bold', opacity: 0.8 }}> {operations && operations.length} / {operation && operation.limitOperation} </p>
                            </Card>
                        </div>
                        <div className='col-md-4'>
                            <Card bordered={false} className='c-card text-center p-1 mb-3'>
                                <h3 className="section-title">Utilisateurs</h3>
                                <Space wrap>
                                    <Progress type="circle" percent={20} status="success" />
                                </Space>
                                <p style={{ fontWeight: 'bold', opacity: 0.8 }}> {operation && operation.users && operation.users.length} / {operation && operation.limitUser} </p>
                            </Card>
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-md-12'>
                            <Table
                                className='mb-3'
                                style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px !important' }}
                                columns={columns}
                                dataSource={QR4YOUFolder?.data}
                                scroll={{ x: '100%' }}
                                loading={isFetchingQR4YOUFolder}
                                //   locale={{ emptyText: props.t('nodata') }}
                                size="middle"
                                // onChange={handleTableChange}
                                showSorterTooltip={false}
                                pagination={false}
                            />
                        </div>
                    </div>

                </div>
                <div className='col-md-4'>
                    <div className='c-card form-section p-4 mb-3'>
                        <h3 className="section-title">Notifications</h3>
                        <List
                            itemLayout="horizontal"
                            dataSource={notifications.slice(0, 3)}
                            renderItem={(notification: Notification) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<FontAwesomeIcon icon={getIcon(notification.icon as IconKey)} />} />}
                                        title={(<><span>{notification.title}</span><span style={{ float: 'right' }}> {getFormattedDate(notification.createdAt)} </span></>)}
                                        description={notification.content}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>

                    <div className='c-card form-section p-4'>
                        <h3 className="section-title">Mises à jour</h3>
                        <List
                            itemLayout="horizontal"
                            dataSource={updates?.slice(0, 3)}
                            renderItem={(update) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={(<><span>{update.version}</span><span style={{ float: 'right' }}> {getFormattedDate(update.createdAt)} </span></>)}
                                        description={formatTextAreaContent(update.content)}
                                    />
                                </List.Item>
                            )}

                        />
                    </div>

                </div>
            </div >
        </>
    );
};

export default withTranslation(withDataManager(AdminHomePage));