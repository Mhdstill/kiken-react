import React, { FC, useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useNavigate,
  Outlet
} from 'react-router-dom';

import FilesPage from './components/Files';
import HomePage from './components/Home';
import DefaultLayout from './components/Layout';
import LoginPage from './components/Login';
import PointerPage from './components/Pointer';
import BottomNavBar from './components/BottomNavBar';
import QRScanner from './components/QRScanner';
import { Role } from './services/auth/auth';
import './App.css'
import './Fonts.css'
import OperationsPage from './components/Administration/Operations';
import UpdatePage from './components/Administration/Update';
import OperationUsersPage from './components/Administration/OperationUsers';
import OperationModulesPage from './components/Administration/OperationModules';
import PointerFieldsPage from './components/Administration/PointerFields';
import UsersPage from './components/Administration/Users';
import SettingsPage from './components/Administration/Settings';
import AdminHomePage from './components/Administration/Home';
import PointersPage from './components/Administration/Pointers';
import { ThemeProvider } from './contexts/ThemeContext';
import { MenuProvider } from './contexts/MenuContext';
import { OperationProvider } from './contexts/OperationContext';

type ProtectedRouteProps = {
  rolesAllowed: Role[];
  children?: React.ReactNode;
};

export const LogoutPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.clear();
    navigate('/login');
  }, []);
  return null;
};

const ProtectedRoute = ({
  rolesAllowed,
  children,
}: ProtectedRouteProps): JSX.Element => {
  const role = localStorage.getItem('role');
  if (role) {
    if (rolesAllowed.find((allowedRole) => role === allowedRole)) {
      return <React.Fragment>{children}</React.Fragment>;
    }
  }
  return <Navigate to="/" replace={true} />;
};

// Wrapper pour ajouter la barre de navigation
const WithBottomNav: FC = () => {
  return (
    <>
      <DefaultLayout />
      <BottomNavBar />
    </>
  );
};

// Wrapper pour la page de formulaire
const FormWithBottomNav: FC = () => {
  return (
    <>
      <PointerPage />
      <BottomNavBar />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <WithBottomNav />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: ':operationToken',
        element: <FilesPage />,
      },
      {
        path: ':operationToken/folder/:folderId',
        element: <FilesPage />,
      },
      {
        path: 'scan',
        element: <QRScanner />,
      },
    ],
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
        <WithBottomNav />
      </ProtectedRoute>
    ),
    children: [
      //Home
      {
        index: true,
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
            <AdminHomePage />
          </ProtectedRoute>
        ),
      },

      //Operation
      {
        path: 'operations/list',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN]}>
            <OperationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operations/clients',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN]}>
            <OperationUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operations/modules',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN]}>
            <OperationModulesPage />
          </ProtectedRoute>
        ),
      },

      //Updates
      {
        path: 'updates',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN]}>
            <UpdatePage />
          </ProtectedRoute>
        ),
      },

      {
        path: 'users',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
            <UsersPage />
          </ProtectedRoute>
        )
      },


      //Pointers
      {
        path: 'pointers/list',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
            <PointersPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'pointers/fields',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
            <PointerFieldsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
            <SettingsPage />
          </ProtectedRoute>
        )
      }


    ],
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'logout',
    element: <LogoutPage />,
  },
  {
    path: ':operationToken/form',
    element: <FormWithBottomNav />
  },
]);

const App: FC = () => {
  return (
    <OperationProvider>
      <ThemeProvider>
        <MenuProvider>
          <RouterProvider router={router} />
        </MenuProvider>
      </ThemeProvider>
    </OperationProvider>
  );
};

export default App;
