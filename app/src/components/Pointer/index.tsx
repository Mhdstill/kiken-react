import React, { FC, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Form, Input, notification, Row } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import Pointer from '../../types/Pointer';

import withTranslation from '../../hoc/withTranslation';
import withDataManager, {
  WithDataManagerProps,
} from '../../hoc/withDataManager';

import './style.less';

const PointerPage: FC = ({
  dataManager,
  t,
}: WithTranslation & WithDataManagerProps) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [emailFilled, setEmailFilled] = useState(false);
  const params = useParams();
  const operationToken = params.operationToken as string;

  const handleErrorResponse = (error: Error, customMessage: string) => {
    setEmailFilled(false);
    notification.error({
      message: error.message,
      description: t(customMessage),
      placement: 'topLeft',
    });
  };

  const handleMakePointer = async (email: string) => {
    try {
      await dataManager.makePointer(operationToken, email);
      setEmailFilled(false);
      navigate(`/${operationToken}/pointer/success`);
    } catch (error) {
      throw new Error("Problème lors du pointage");
    }
  };

  const handleCreatePersonPointer = (values: any) => {
    try {
      return dataManager.createPersonPointer(
        operationToken,
        values.email,
        values.lastname,
        values.firstname
      );
    } catch (error) {
      throw new Error("Problème lors de la création d'une personne.");
    }
  };

  const handleGetPersonPointerByEmail = async (email: string): Promise<Pointer | null> => {
    try {
      return await dataManager.getPersonPointerByEmail(
        operationToken,
        email
      );
    } catch (error) {
      throw new Error("Problème lors de la récupération d'une personne.");
    }
  };

  // Form validation
  const { mutate, isLoading } = useMutation(handleCreatePersonPointer, {
    onSuccess: (data, variables) => {
      try {
        handleMakePointer(variables.email);
      }
      catch (error) {
        handleErrorResponse(error, 'error_description');
      }
    },
    onError: (error: any) => {
      form.resetFields();
      handleErrorResponse(error, 'error_description');
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

  // OnChange email
  const onEmailFilled = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailFilled(false);
      return;
    }

    try {
      const res = await handleGetPersonPointerByEmail(email);
      if (res !== null && res !== undefined) {
        await handleMakePointer(email);
      } else {
        setEmailFilled(true);
      }
    } catch (error) {
      handleErrorResponse(error, 'error_description');
    }
  };



  return (
    <section className="vh-100 login" style={{ backgroundColor: '#1E1C22 !important' }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-2-strong" style={{ borderRadius: '1rem' }}>
              <div className="card-body p-5 text-center">

                <img style={{ height: '60px' }} src="/images/logo.svg" alt="Logo de QR4You"></img>

                <h3 className='mt-2 title-txt'>Pointer</h3>
                <Card>
                  <Form
                    form={form}
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                  >
                    <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                      <Input
                        placeholder={t('email.label')}
                        className='form-control form-control-lg focused bg-white mb-3 input-with-value'
                        onChange={onEmailFilled}
                      />
                    </Form.Item>
                    {emailFilled && ( // Afficher les champs supplémentaires si l'email est rempli
                      <>
                        <Form.Item name="firstname" rules={[{ required: true }]}>
                          <Input
                            placeholder={t('pointer.form.firstname')}
                            className='form-control form-control-lg focused bg-white mb-3 input-with-value'

                          />
                        </Form.Item>

                        <Form.Item name="lastname" rules={[{ required: true }]}>
                          <Input
                            placeholder={t('pointer.form.lastname')}
                            className='form-control form-control-lg focused bg-white mb-3 input-with-value'
                          />
                        </Form.Item>

                        <Row justify="center">
                          <Button type="primary" htmlType="submit" loading={isLoading} className='ant-btn ant-btn-default ant-btn-sm'>
                            {t('pointer.form.submit')}
                          </Button>
                        </Row>
                      </>
                    )}
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

export default withTranslation(withDataManager(PointerPage));
