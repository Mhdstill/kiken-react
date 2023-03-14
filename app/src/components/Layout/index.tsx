import React, { FC } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import Footer from '../Footer';
import Navbar from '../Navbar';

import './style.less';
import Sidebar from '../Sidebar';

const { Content } = Layout;

const DefaultLayout: FC = () => {
  return (
    <Layout className="layout">
      <Sidebar />
      <Navbar />
      <div className="container-fluid py-4">
          <Outlet />
        </div>
      <Footer />
    </Layout>
  );
};

export default DefaultLayout;
