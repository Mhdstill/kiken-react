import React, { useState } from 'react';
import { faUser, faClipboardList, faHome, faRightFromBracket, faSignature, faBuilding, faChevronRight, faChevronDown, faTable, faList, faUserTie, faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    isAuthorized,
    OperationAction,
    UserAction,
} from '../../services/auth/auth';
import { useNavigate } from 'react-router-dom';
import NavItem from '../NavbarList/NavItem';

const Sidebar = () => {

    /* const { Footer: BaseFooter } = Layout; */
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

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

    const handleMouseOver = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const operationItems = [
        {
            title: "Liste",
            icon: faTable,
            path: "/admin/operations/list"
        },
        {
            title: "Clients",
            icon: faUserTie,
            path: "/admin/operations/clients"
        },
    ]

    const pointerItems = [
        {
            title: "Liste",
            icon: faTable,
            path: "/pointers/list"
        },
        {
            title: "Adresses",
            icon: faBuilding,
            path: "/pointers/addresses"
        },
        {
            title: "Champs",
            icon: faClipboardList,
            path: "/pointers/addresses"
        },
    ]

    return (
        <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 bg-gradient-dark" id="sidenav-main">
            <div className="sidenav-header">
                <i className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-xl-none" aria-hidden="true" id="iconSidenav"></i>
                <img style={{ height: '40px' }} src="/images/logo.svg" alt="Logo de QR4You"></img>
            </div>
            <hr className="horizontal light mt-0 mb-2" />
            <div className="collapse navbar-collapse  w-auto  h-100" id="sidenav-collapse-main">

                <ul className="navbar-nav">
                    <li className="nav-item mt-3">
                        <h6 className="ps-4 ms-2 text-uppercase text-white font-weight-bolder opacity-8" style={{ fontSize: '1rem !important' }} >Pages</h6>
                    </li>

                    <NavItem title="Accueil" icon={faHome} path={`/${operationToken}`} />

                    {opAuth ? (
                        <>
                            <NavItem title="Opérations" icon={faClipboardList} path="/admin/operations" dropdownItems={operationItems} />
                        </>
                    )
                        :
                        (<></>)
                    }

                    {usAuth ? (
                        <>
                            <NavItem title="Pointages" icon={faSignature} path="/admin/pointers" dropdownItems={pointerItems} />
                            <NavItem title="Utilisateurs" icon={faUser} path="/admin/users" />
                        </>
                    )
                        :
                        (<></>)
                    }

                    {isOnline ?
                        (<NavItem title="Déconnexion" icon={faRightFromBracket} path={"logout"} />)
                        :
                        (<NavItem title="Connexion" icon={faUser} path={"/"} />)
                    }
                </ul>
            </div>
        </aside >
    );
};

export default Sidebar;