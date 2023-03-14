import React, { useState } from 'react';
import { Drawer, Layout, Menu, MenuProps, MenuTheme } from 'antd';
import { MenuMode } from 'rc-menu/lib/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import type { WithTranslation } from 'react-i18next';

import withTranslation from '../../hoc/withTranslation';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  isAuthorized,
  OperationAction,
  UserAction,
} from '../../services/auth/auth';

import './style.less';

const { Header } = Layout;

const Navbar: React.FC = ({ t }: WithTranslation) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getMenu = () => {
    const menu: MenuProps['items'] = [];
    menu.push({
      label: t('home'),
      key: '/',
    });
    if (sessionStorage.getItem('token')) {
      const opAuth = Object.values(OperationAction).find((action) =>
        isAuthorized(action)
      );
      const usAuth = Object.values(UserAction).find((action) =>
        isAuthorized(action)
      );
      if (opAuth || usAuth) {
        menu.push({
          label: 'Administration',
          key: '/admin',
        });
      }
      menu.push({
        label: t('menu.logout'),
        key: '/logout',
      });
    } else {
      menu.push({
        label: t('menu.login'),
        key: '/login',
      });
    }
    return menu;
  };

  const getMenuComponent = (
    mode = 'vertical',
    theme: string | undefined = undefined
  ) => {
    return (
      <Menu
        theme={theme as MenuTheme}
        selectedKeys={[pathname]}
        onClick={menuOnClick}
        mode={mode as MenuMode}
        items={getMenu()}
      />
    );
  };

  const menuOnClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    setOpenDrawer(false);
  };

  const getDrawer = () => {
    return isMobile ? (
      <Drawer
        open={openDrawer}
        placement="right"
        title={null}
        closable={false}
        onClose={() => setOpenDrawer(false)}
        drawerStyle={{ overflowX: 'hidden' }}
        width={260}
      >
        {getMenuComponent()}
      </Drawer>
    ) : null;
  };

  const getNavbar = () => {
    return isMobile ? (
      <div className="hamburger-wrapper">
        <MenuOutlined
          className="hamburger"
          onClick={() => setOpenDrawer(true)}
        />
      </div>
    ) : (
      getMenuComponent('horizontal', 'dark')
    );
  };

  return (
    <Header>
      <div className="logo" />
      {getNavbar()}
      {getDrawer()}
    </Header>
  );
};

export default withTranslation(Navbar);
