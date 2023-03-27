import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Layout, Menu, MenuProps, MenuTheme } from 'antd';
import { MenuMode } from 'rc-menu/lib/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';
import { faHouse, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import withTranslation from '../../hoc/withTranslation';
import { useIsMobile } from '../../hooks/useIsMobile';

import './style.less';

const { Header } = Layout;

const Navbar: React.FC = ({ t }: WithTranslation) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const navRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('g-sidenav-pinned');
    } else {
      document.body.classList.remove('g-sidenav-pinned');
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsMenuOpen, isMenuOpen, navRef]);

  const handleIconClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <Header>
        <nav
          ref={navRef}
          className="fs-3 navbar navbar-main"
          id="navbarBlur" navbar-scroll="true"
        >
          <img style={{ height: '40px', cursor: 'pointer' }} onClick={() => navigate("/")} src="https://my.wastreet.app//public/assets/img/logos/logo-wastreet.svg" alt="Logo de Wastreet" />
          <FontAwesomeIcon icon={faBars} style={{ float: 'right', color: 'white', cursor: 'pointer' }} onClick={handleIconClick} />
        </nav>
      </Header>
    </>
  );
};

export default withTranslation(Navbar);
