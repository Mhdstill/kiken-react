import React, { FC, useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';

import Footer from '../Footer';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

import './style.less';

const { Content } = Layout;

const DefaultLayout: FC = () => {
  const location = useLocation();
  const [containerClass, setContainerClass] = useState<string>('container-fluid');
  const operationToken = sessionStorage.getItem('operation_token');

  // Fonction pour mettre à jour la classe en fonction de la page
  const updateContainerClass = () => {
    console.log(operationToken);
    if (operationToken && (location.pathname === `/${operationToken}` || location.pathname.startsWith(`/${operationToken}/folder/`))) {
      setContainerClass('container-fluid page-home');
    } else if (location.pathname === '/page2') {
      setContainerClass('container-fluid page2-container');
    } else {
      setContainerClass('container-fluid');
    }
  };

  // Appeler la fonction de mise à jour lorsque l'emplacement change
  useEffect(() => {
    updateContainerClass();
  }, [location.pathname]);

  return (
    <Layout className="layout">
      <Sidebar />
      <Navbar />
      <div className={`${containerClass} py-4`}>
        <Outlet />
      </div>
      <Footer />
    </Layout>
  );
};

export default DefaultLayout;
