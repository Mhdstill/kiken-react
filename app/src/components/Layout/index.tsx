import React, { FC } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import Footer from '../Footer';
import Navbar from '../Navbar';

import './style.less';

const { Content } = Layout;

const DefaultLayout: FC = () => {
  return (
    <Layout className="layout">
      <Navbar />
      <Content className="content-wrapper">
        <div className="content">
          <Outlet />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default DefaultLayout;
