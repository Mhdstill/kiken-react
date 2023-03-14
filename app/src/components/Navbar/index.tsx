import React, { useState, useEffect } from 'react';
import { Drawer, Layout, Menu, MenuProps, MenuTheme } from 'antd';
import { MenuMode } from 'rc-menu/lib/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import type { WithTranslation } from 'react-i18next';
import { faHouse, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Sidebar from '../Sidebar';

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
      <nav className="navbar navbar-expand-lg bg-secondary text-uppercase fixed-top navbar-shrink" id="mainNav">
        <div className="container">
          <div className="navbar-brand">Start Bootstrap</div>
          <div className="hamburger-wrapper">
            <MenuOutlined
              className="hamburger"
              onClick={() => setOpenDrawer(!openDrawer)}
            />
          </div>
        </div>
      </nav>
    ) : (
      <nav
        className="fs-5 navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl mt-2"
        id="navbarBlur" navbar-scroll="true"
        style={{ backgroundColor: '#113A53' }}
      >
        <div className="container-fluid py-1 px-3">
          <img style={{ height: '40px' }} src="../public/assets/img/logos/logo-wastreet.svg" alt="Logo de Wastreet"></img>
          <div className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="sidebar">
              <ul id="id_menu" className="sidebar-list-wrapper">
                <li className="sidebar-list-item">
                  <a href="#accueil" className="sidebar-list-link sidebar-list-link-active">
                    <FontAwesomeIcon icon={faHouse} className="me-2" />
                    <span className="sidebar-list-link-text">Accueil</span>
                  </a>
                </li>
                <li className="sidebar-list-item">
                  <a href="#users" className="sidebar-list-link ">
                    <FontAwesomeIcon icon={faBars} />
                    <span className="sidebar-list-link-text">Connexion</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav >
    );
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('g-sidenav-pinned');
    } else {
      document.body.classList.remove('g-sidenav-pinned');
    }
  }, [isMenuOpen]);

  return (
    <>
      <Header>
        <nav
          className="fs-3 navbar navbar-main"
          id="navbarBlur" navbar-scroll="true"
        >
          <img style={{ height: '40px' }} src="https://my.wastreet.app//public/assets/img/logos/logo-wastreet.svg" alt="Logo de Wastreet" />
          <FontAwesomeIcon icon={faBars} style={{ float: 'right', color: 'white', cursor: 'pointer' }} onClick={() => setIsMenuOpen(!isMenuOpen)} />
        </nav>
      </Header>
    </>
  );
};

export default withTranslation(Navbar);
