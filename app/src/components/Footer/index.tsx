import React from 'react';
import { Layout } from 'antd';
const { Footer: BaseFooter } = Layout;

const Footer = () => {
  return (
    <BaseFooter style={{ textAlign: 'center' }}>
      ©2023 Kiken QR
    </BaseFooter>
  );
};

export default Footer;
