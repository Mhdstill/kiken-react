import React, { FC, useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';

import FilesPage from './components/Files';
import HomePage from './components/Home';
import DefaultLayout from './components/Layout';
import LoginPage from './components/Login';
import PointerPage from './components/Pointer';
import { Role } from './services/auth/auth';
import './App.css'
import './Fonts.css'
import PointerSuccessPage from './components/PointerSuccess';
import OperationsPage from './components/Administration/Operations';
import OperationUsersPage from './components/Administration/OperationUsers';
import OperationModulesPage from './components/Administration/OperationModules';
import PointerFieldsPage from './components/Administration/PointerFields';
import UsersPage from './components/Administration/Users';
import PointersPage from './components/Administration/Pointers';
import { ThemeProvider } from './contexts/ThemeContext';

type ProtectedRouteProps = {
  rolesAllowed: Role[];
  children?: React.ReactNode;
};

export const LogoutPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.clear();
    navigate('/');
  }, []);
  return null;
};

const ProtectedRoute = ({
  rolesAllowed,
  children,
}: ProtectedRouteProps): JSX.Element => {
  const role = sessionStorage.getItem('role');
  if (role) {
    if (rolesAllowed.find((allowedRole) => role === allowedRole)) {
      return <React.Fragment>{children}</React.Fragment>;
    }
  }
  return <Navigate to="/" replace={true} />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
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
    ],
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
        <DefaultLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true },

      //Operation
      {
        path: 'operations/list',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN]}>
            <OperationsPage />
          </ProtectedRoute>
        ),
      },
      { index: true },
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
        path: 'pointers',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
            <PointersPage />
          </ProtectedRoute>
        )
      },
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
    path: ':operationToken/pointer',
    element:
      <PointerPage />
  },
  {
    path: ':operationToken/pointer/success',
    element:
      <PointerSuccessPage />
  }
]);

const App: FC = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
