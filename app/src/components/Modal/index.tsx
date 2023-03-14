import React from 'react';
import { Modal } from 'antd';
import type { WithTranslation } from 'react-i18next';

import withTranslation from '../../hoc/withTranslation';

interface CustomModalProps extends WithTranslation {
  showModal: boolean;
  onOk: () => void;
  okText?: string;
  onCancel: () => void;
  children?: React.ReactNode;
}

const CustomModal = ({
  t,
  showModal,
  onOk,
  okText,
  onCancel,
  children,
}: CustomModalProps) => {
  return (
    <Modal
      centered
      open={showModal}
      onOk={onOk}
      okText={okText || t('modal.ok')}
      onCancel={onCancel}
      cancelText={t('modal.close')}
      bodyStyle={{ display: 'flex', justifyContent: 'center' }}
      destroyOnClose
    >
      {children}
    </Modal>
  );
};

export default withTranslation(CustomModal);
