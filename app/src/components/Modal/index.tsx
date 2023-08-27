import React from 'react';
import { Modal, Button } from 'antd';
import type { WithTranslation } from 'react-i18next';

import withTranslation from '../../hoc/withTranslation';

interface CustomModalProps extends WithTranslation {
  showModal: boolean;
  onOk: () => void;
  okText?: string|boolean;
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
  let footer = [];

  console.log(okText);

  if (okText === false) {
    footer = [];
  } else {
    footer.push(
      <Button key="ok" type="primary" onClick={onOk}>
        {okText || t('modal.ok')}
      </Button>
    );
  }

  return (
    <Modal
      centered
      open={showModal}
      onOk={onOk}
      okText={okText || t('modal.ok')}
      onCancel={onCancel}
      // cancelText={t('modal.close')}
      bodyStyle={{ display: 'flex', justifyContent: 'center' }}
      destroyOnClose
      footer={footer}
    >
      {children}
    </Modal>
  );
};

export default withTranslation(CustomModal);
