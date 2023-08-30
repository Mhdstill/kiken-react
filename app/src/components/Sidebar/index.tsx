import React from 'react';
import { faUser, faClipboardList, faHome, faRightFromBracket, faSignature } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    isAuthorized,
    OperationAction,
    UserAction,
} from '../../services/auth/auth';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {

    /* const { Footer: BaseFooter } = Layout; */
    const navigate = useNavigate();

    var isOnline = false;
    var operationToken = null;
    if (sessionStorage.getItem('token')) {
        var opAuth = Object.values(OperationAction).find((action) =>
            isAuthorized(action)
        );
        var usAuth = Object.values(UserAction).find((action) =>
            isAuthorized(action)
        );
        operationToken = sessionStorage.getItem('operation_token');
        isOnline = true;
    }

    return (
        <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 bg-gradient-dark" id="sidenav-main">
            <div className="sidenav-header">
                <i className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-xl-none" aria-hidden="true" id="iconSidenav"></i>
                <img style={{ height: '40px' }} src="/images/logo.svg" alt="Logo de QR4You"></img>
            </div>
            <hr className="horizontal light mt-0 mb-2" />
            <div className="collapse navbar-collapse  w-auto  max-height-vh-100" id="sidenav-collapse-main">
                <ul className="navbar-nav">
                    <li className="nav-item mt-3">
                        <h6 className="ps-4 ms-2 text-uppercase text-white font-weight-bolder opacity-8" style={{ fontSize: '1rem !important' }} >Pages</h6>
                    </li>
                    <li className={`nav-item ${location.pathname === `/${operationToken}` ? "active" : ""}`} onClick={() => navigate("/")}>
                        <a className="nav-link text-white" onClick={(event) => { event.preventDefault(); }}>
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <FontAwesomeIcon icon={faHome} style={{ fontSize: '1.2rem' }} className="fas fa-user-circle ps-2 pe-2 text-center" />
                            </div>
                            <span className="nav-link-text ms-1">Accueil</span>
                        </a>
                    </li>
                    {opAuth ? (
                        <li className={`nav-item ${location.pathname === "/admin/operations" ? "active" : ""}`} onClick={() => navigate("/admin/operations")}>
                            <a className="nav-link text-white" onClick={(event) => { event.preventDefault(); }}>
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: '1.2rem' }} className="fas fa-user-circle ps-2 pe-2 text-center" />
                                </div>
                                <span className="nav-link-text ms-1">Opérations</span>
                            </a>
                        </li>)
                        :
                        (<></>)
                    }

                    {usAuth ? (
                        <>
                            <li className={`nav-item ${location.pathname === "/admin/users" ? "active" : ""}`} onClick={() => navigate("/admin/users")}>
                                <a className="nav-link text-white" onClick={(event) => { event.preventDefault(); }}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <FontAwesomeIcon icon={faUser} style={{ fontSize: '1.2rem' }} className="fas fa-user-circle ps-2 pe-2 text-center" />
                                    </div>
                                    <span className="nav-link-text ms-1">Utilisateurs</span>
                                </a>
                            </li>
                            {usAuth ? (
                                <li className={`nav-item ${location.pathname === "/admin/pointers" ? "active" : ""}`} onClick={() => navigate("/admin/pointers")}>
                                    <a className="nav-link text-white" onClick={(event) => { event.preventDefault(); }}>
                                        <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                            <FontAwesomeIcon icon={faSignature} style={{ fontSize: '1.2rem' }} className="fas fa-user-circle ps-2 pe-2 text-center" />
                                        </div>
                                        <span className="nav-link-text ms-1">Pointeurs</span>
                                    </a>
                                </li>
                            ) : (<></>)
                            }

                        </>
                    )
                        :
                        (<></>)
                    }

                    {isOnline ? (
                        <li className="nav-item" onClick={() => navigate("/logout")}>
                            <a className="nav-link text-white" onClick={(event) => { event.preventDefault(); }}>
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: '1.2rem' }} className="fas fa-user-circle ps-2 pe-2 text-center" />
                                </div>
                                <span className="nav-link-text ms-1">Déconnexion</span>
                            </a>
                        </li>
                    )
                        :
                        (<li className="nav-item" onClick={() => navigate("/")}>
                            <a className="nav-link text-white" onClick={(event) => { event.preventDefault(); }}>
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <FontAwesomeIcon icon={faUser} style={{ fontSize: '1.2rem' }} className="fas fa-user-circle ps-2 pe-2 text-center" />
                                </div>
                                <span className="nav-link-text ms-1">Connexion</span>
                            </a>
                        </li>)
                    }
                </ul>
            </div>
        </aside >
    );
};

export default Sidebar;