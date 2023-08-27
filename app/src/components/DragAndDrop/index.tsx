import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import type { UploadProps } from 'antd/lib/upload';

interface DragAndDropProps extends UploadProps {
    onFileUpload?: (file: any) => void;
    customRequest: (options: any) => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({ onFileUpload, customRequest, ...props }) => {
    const uploadProps: UploadProps = {
        name: 'file',
        multiple: true,
        customRequest,
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        ...props,
    };

    return (
        <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">Cliquez/Glisser fichier(s) vers cette zone</p>
            <p className="ant-upload-hint">
                Prise en charge d'un téléchargement unique ou groupé. Il est strictement interdit de télécharger des données d'entreprise ou d'autres fichiers interdits.
            </p>
        </Upload.Dragger>
    );
};

export default DragAndDrop;
