import React, { useState } from 'react';
import { faUser, faClipboardList, faHome, faRightFromBracket, faSignature, faBuilding, faChevronRight, faChevronDown, faTable, faList, faUserTie, faGear, faGears, faFolder, faShop, faCircle, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    FileAction,
    isAuthorized,
    OperationAction,
    PointerAction,
    UserAction,
} from '../../services/auth/auth';
import { useNavigate } from 'react-router-dom';
import NavItem from '../NavbarList/NavItem';
import { useOperation } from '../../contexts/OperationContext';
import { Select } from 'antd';

const Sidebar = () => {

    /* const { Footer: BaseFooter } = Layout; */
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const { Option } = Select;

    const { operations, setOperationToken, operationToken } = useOperation();
    const [selectedOperation, setSelectedOperation] = useState(sessionStorage.getItem('operation_token'));

    const handleOperationChange = (value: string) => {
        setSelectedOperation(value);
        setOperationToken(value);
        sessionStorage.setItem('operation_token', value);
    };

    var isOnline = false;
    if (sessionStorage.getItem('token')) {
        var opAuth = Object.values(OperationAction).find((action) =>
            isAuthorized(action)
        );
        var usAuth = Object.values(UserAction).find((action) =>
            isAuthorized(action)
        );
        var ptAuth = Object.values(PointerAction).find((action) =>
            isAuthorized(action)
        );
        var qrdAuth = Object.values(FileAction).find((action) =>
            isAuthorized(action)
        );
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
            title: "Sites",
            icon: faTable,
            path: "/admin/operations/list"
        },
        {
            title: "Clients",
            icon: faUserTie,
            path: "/admin/operations/clients",
            access: "OP"
        },
        {
            title: "Modules",
            icon: faGears,
            path: "/admin/operations/modules"
        },
    ]

    const pointerItems = [
        {
            title: "Liste",
            icon: faTable,
            path: "/admin/pointers/list"
        },
        {
            title: "Champs",
            icon: faClipboardList,
            path: "/admin/pointers/fields"
        },
    ]
    return (
        <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 bg-gradient-dark" id="sidenav-main">
            <div className="sidenav-header">
                <i className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-xl-none" aria-hidden="true" id="iconSidenav"></i>
                <img style={{ height: '48px' }} src="/images/logo.svg" alt="Logo de QR4You"></img>
            </div>
            <hr className="horizontal light mt-0 mb-2" />
            <div className="collapse navbar-collapse  w-auto  h-100" id="sidenav-collapse-main">

                <ul className="navbar-nav">
                    <li className="nav-item mt-3">
                        <h6 className="ps-4 ms-2 text-uppercase text-white font-weight-bolder opacity-8" style={{ fontSize: '1rem !important' }} >Pages</h6>
                    </li>

                    <>
                        {usAuth ? (<NavItem title="Accueil" icon={faHome} path={"/admin"} />) : (<></>)}
                    </>

                    {qrdAuth ? (
                        <>
                            <NavItem title="QR Drive" icon={faFolder} path={`/${operationToken}`} />
                        </>
                    )
                        :
                        (<></>)
                    }


                    {opAuth ? (
                        <>
                            <NavItem title="Opérations" icon={faShop} path="/admin/operations" dropdownItems={operationItems} />
                            <NavItem title="Mises à jour" icon={faArrowsRotate} path="/admin/updates" />
                        </>
                    )
                        :
                        (<></>)
                    }

                    {ptAuth ? (
                        <>
                            <NavItem title="QR Form" icon={faClipboardList} path="/admin/pointers" dropdownItems={pointerItems} />
                        </>
                    )
                        :
                        (<></>)
                    }

                    {usAuth ? (
                        <>
                            <NavItem title="Utilisateurs" icon={faUser} path="/admin/users" />
                        </>
                    )
                        :
                        (<></>)
                    }


                    {isOnline ?
                        (
                            <>
                                {usAuth ? (<NavItem title="Paramètres" icon={faGear} path={"/admin/settings"} />) : (<></>)}
                                <NavItem title="Déconnexion" icon={faRightFromBracket} path={"/logout"} />


                                <h6 className="ps-4 mt-4 ms-2 text-uppercase text-white font-weight-bolder opacity-8" style={{ fontSize: '1rem !important' }} >Operation</h6>
                                <div className='px-4'>
                                    <Select
                                        value={selectedOperation}
                                        onChange={handleOperationChange}
                                        style={{ width: '100%' }}
                                    >
                                        {operations.map(op => (
                                            <Option key={op.id} value={op.id} selected={(op.id === operationToken)}>{op.name}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </>
                        )
                        :
                        (<NavItem title="Connexion" icon={faUser} path={"/"} />)
                    }

                </ul>
            </div>
        </aside >
    );
};

export default Sidebar;