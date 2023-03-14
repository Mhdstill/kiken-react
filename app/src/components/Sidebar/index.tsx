import React, {useState} from 'react';
import { Layout } from 'antd';
import { faHouse, faBars, faUserCircle, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const { Footer: BaseFooter } = Layout;

const Sidebar = () => {


    return (
        <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 bg-gradient-dark" id="sidenav-main">
            <div className="sidenav-header">
            <i className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-xl-none" aria-hidden="true" id="iconSidenav"></i>
                <img style={{ height: '40px' }} src="https://my.wastreet.app/public/assets/img/logos/logo-wastreet.svg" alt="Logo de Wastreet"></img>
            </div>
            <hr className="horizontal light mt-0 mb-2" />
            <div className="collapse navbar-collapse  w-auto  max-height-vh-100" id="sidenav-collapse-main">
                <ul className="navbar-nav">
                    <li className="nav-item mt-3">
                        <h6 className="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Pages</h6>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white  " href="https://material-dashboard-laravel.creative-tim.com/user-profile">
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '1.2rem' }} className="fas fa-user-circle ps-2 pe-2 text-center" />
                            </div>
                            <span className="nav-link-text ms-1">User Profile</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white  " href="https://material-dashboard-laravel.creative-tim.com/user-management">
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <i style={{ fontSize: '1rem' }} className="fas fa-lg fa-list-ul ps-2 pe-2 text-center" aria-hidden="true"></i>
                            </div>
                            <span className="nav-link-text ms-1">User Management</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;