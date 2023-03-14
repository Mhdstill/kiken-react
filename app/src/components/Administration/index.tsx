import React from 'react';
import { Tabs } from 'antd';
import { ToolOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';

import UsersTab from './Users';
import OperationsTab from './Operations';
import withTranslation from '../../hoc/withTranslation';
import {
  isAuthorized,
  OperationAction,
  UserAction,
} from '../../services/auth/auth';

import './style.less';

const AdministrationPage = ({
  t,
  selectedKey,
}: WithTranslation & { selectedKey?: string }) => {
  const navigate = useNavigate();

  const items = [];

  const opAuth = Object.values(OperationAction).find((action) =>
    isAuthorized(action)
  );

  if (opAuth) {
    items.push({
      label: (
        <span>
          <ToolOutlined />
          {t('admin.operationsTab')}
        </span>
      ),
      key: 'operations',
      children: <OperationsTab inTab={true} />,
    });
  }

  const usAuth = Object.values(UserAction).find((action) =>
    isAuthorized(action)
  );

  if (usAuth) {
    items.push({
      label: (
        <span>
          <UserOutlined />
          {t('admin.usersTab')}
        </span>
      ),
      key: 'users',
      children: <UsersTab inTab={true} />,
    });
  }

  return (
    <div className="card-container">
      <Tabs
        type="card"
        defaultActiveKey={items[0].key}
        activeKey={selectedKey}
        items={items}
        onChange={(key) => navigate(`/admin/${key}`)}
      />
    </div>
  );
};

export default withTranslation(AdministrationPage);
