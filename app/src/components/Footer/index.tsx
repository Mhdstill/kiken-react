import React from 'react';
import { Layout } from 'antd';
const { Footer: BaseFooter } = Layout;

const Footer = () => {
  return (
    <BaseFooter style={{ textAlign: 'center' }}>
      Ant Design ©2018 Created by Ant UED
    </BaseFooter>
  );
};

export default Footer;
