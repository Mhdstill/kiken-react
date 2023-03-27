import React from 'react';
import { Layout } from 'antd';
const { Footer: BaseFooter } = Layout;

const Footer = () => {
  return (
    <BaseFooter style={{ textAlign: 'center', fontSize: '1rem' }}>
      ©2023 Kiken QR
    </BaseFooter>
  );
};

export default Footer;
