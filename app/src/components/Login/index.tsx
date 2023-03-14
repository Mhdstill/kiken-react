import React, { FC } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Form, Input, notification, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';

import withTranslation from '../../hoc/withTranslation';
import withDataManager, {
  WithDataManagerProps,
} from '../../hoc/withDataManager';

import './style.less';

const LoginPage: FC = ({
  dataManager,
  t,
}: WithTranslation & WithDataManagerProps) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  if (sessionStorage.getItem('token')) {
    const operationToken = sessionStorage.getItem('operation_token');
    if (operationToken) {
      navigate(`/${operationToken}`);
    } else {
      navigate('/');
    }
  }

  const login = async (values: any) => {
    return await dataManager.login(values.email, values.password);
  };

  const { mutate, isLoading } = useMutation(login, {
    onSuccess: (data) => {
      const { token, refreshToken, role, operationToken } = data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('refresh_token', refreshToken);
      sessionStorage.setItem('role', role);
      if (operationToken) {
        sessionStorage.setItem('operation_token', operationToken);
        navigate(`/${operationToken}`);
      } else {
        navigate(-1);
      }
    },
    onError: (e) => {
      console.error(e);
      form.resetFields();
      notification.error({
        message: t('error'),
        description: t('login.errorMessage'),
      });
    },
  });

  const onFinish = async (values: any) => {
    mutate(values);
  };

  const validateMessages = {
    required: t('login.invalidInput', { input: '${name}' }),
    types: {
      email: t('email.invalidMessage'),
    },
  };

  return (
    <div className="login-view-container">
      <Card>
        <Form
          form={form}
          onFinish={onFinish}
          validateMessages={validateMessages}
        >
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder={t('email.label')} />
          </Form.Item>

          <Form.Item
            name="password"
            messageVariables={{ name: t('password').toLowerCase() }}
            rules={[{ required: true }]}
          >
            <Input.Password placeholder={t('password')} />
          </Form.Item>

          <Row justify="center">
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {t('login.submit')}
            </Button>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default withTranslation(withDataManager(LoginPage));
