import React, { FC, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Form, Input, notification, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import withTranslation from '../../hoc/withTranslation';
import withDataManager, {
  WithDataManagerProps,
} from '../../hoc/withDataManager';
import { useTheme } from '../../contexts/ThemeContext';
import './style.less';
import { useOperation } from '../../contexts/OperationContext';

const LoginPage: FC = ({
  dataManager,
  t,
}: WithTranslation & WithDataManagerProps) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { isDarkMode, toggleTheme } = useTheme();
  const { setOperations, setOperationToken } = useOperation();

  if (sessionStorage.getItem('token')) {
    const operationToken = sessionStorage.getItem('operation_token');
    navigate('/admin');
  }

  const login = async (values: any) => {
    return await dataManager.login(values.email, values.password);
  };

  const { mutate, isLoading } = useMutation(login, {
    onSuccess: (data) => {
      const { token, refreshToken, role, modules, operations, driveAccess } = data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('refresh_token', refreshToken);
      sessionStorage.setItem('role', role);
      sessionStorage.setItem('modules', JSON.stringify(modules));
      sessionStorage.setItem('driveAccess', JSON.stringify(driveAccess));
      sessionStorage.setItem('operations', JSON.stringify(operations));

      if (operations && operations.length >= 1) {
        const operationToken = operations[0].id;
        sessionStorage.setItem('operation_token', operationToken);
        setOperationToken(operationToken);
        setOperations(operations);
        navigate('/admin');
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
        placement: 'topLeft'
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
    <section className="vh-100 login" style={{ backgroundColor: '#1E1C22 !important' }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-2-strong" style={{ borderRadius: '1rem' }}>
              <div className="card-body p-5 text-center">

                <img style={{ height: '60px' }} src={!isDarkMode ? "/images/logo-black.svg" : "/images/logo.svg"} alt="Logo de QR4You"></img>

                <h3 className='mt-2 title-txt'>Connexion</h3>
                <Card>
                  <Form
                    form={form}
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                  >
                    <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                      <Input placeholder={t('email.label')} className='form-control form-control-lg focused bg-white mb-3 input-with-value' />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      messageVariables={{ name: t('password').toLowerCase() }}
                      rules={[{ required: true }]}
                    >
                      <Input.Password
                        placeholder={t('password')}
                        className='form-control form-control-lg focused bg-white mb-3 input-with-value'
                      />
                    </Form.Item>

                    <Row justify="center">
                      <Button type="primary" htmlType="submit" loading={isLoading} className='ant-btn ant-btn-default ant-btn-sm'>
                        {t('login.submit')}
                      </Button>
                    </Row>
                  </Form>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default withTranslation(withDataManager(LoginPage));
