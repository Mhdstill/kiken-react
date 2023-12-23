import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Layout, Menu, MenuProps, MenuTheme } from 'antd';
import { MenuMode } from 'rc-menu/lib/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';
import { faHouse, faBars, faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '../../contexts/ThemeContext';
import withTranslation from '../../hoc/withTranslation';
import { useIsMobile } from '../../hooks/useIsMobile';
import './style.less';
import { useMenuContext } from '../../contexts/MenuContext';

const { Header } = Layout;

const Navbar: React.FC = ({ t }: WithTranslation) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const navRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMenuOpen, setIsMenuOpen } = useMenuContext();

  const handleIconClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <Header>
        <nav
          ref={navRef}
          className="fs-3 navbar navbar-main d-flex align-items-center justify-content-center"
          id="navbarBlur" navbar-scroll="true"
        >
          <FontAwesomeIcon icon={faBars} className='menu-icon' style={{ position: 'absolute', left: 0, color: 'white', cursor: 'pointer' }} onClick={handleIconClick} />
          <img style={{ height: '40px', cursor: 'pointer' }} onClick={() => navigate("/")} src="/images/logo.svg" alt="Logo de QR4You" />

          <span onClick={toggleTheme} className='toggle-mode'>
            <FontAwesomeIcon icon={faPaintBrush} className='toggle-mode-i me-2' />
            {isDarkMode ? 'Mode Sombre' : 'Mode Clair'}
          </span>
        </nav>
      </Header>
    </>
  );
};

export default withTranslation(Navbar);
