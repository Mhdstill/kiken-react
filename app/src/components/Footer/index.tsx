import React from 'react';
import { Layout } from 'antd';
const { Footer: BaseFooter } = Layout;

const Footer = () => {
  return (
    <BaseFooter style={{ textAlign: 'center', fontSize: '1rem' }}>
      ©2023 QR4YOU
    </BaseFooter>
  );
};

export default Footer;
