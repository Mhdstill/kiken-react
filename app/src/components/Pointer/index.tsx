import React, { FC, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Checkbox, DatePicker, Form, Input, notification, Radio, Row, Slider } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';
import { EyeInvisibleOutlined, EyeOutlined, LeftOutlined } from '@ant-design/icons';
import Pointer from '../../types/Pointer';

import withTranslation from '../../hoc/withTranslation';
import withDataManager, {
  WithDataManagerProps,
} from '../../hoc/withDataManager';

import './style.less';
import { getType, getTypeString } from '../../types/PointerField';
import TextArea from 'antd/lib/input/TextArea';

const PointerPage: FC = ({
  dataManager,
  t,
}: WithTranslation & WithDataManagerProps) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const params = useParams();
  const operationToken = params.operationToken as string;

  const [step, setStep] = useState(1);
  const [identifierValue, setIdentifierValue] = useState("");
  const [firstStepValues, setFirstStepValues] = useState([]);


  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = '/AppLightMode.css';
  document.head.appendChild(link);



  //Messages Handles
  const handleErrorResponse = (error: Error, customMessage: string) => {
    notification.error({
      message: error.message,
      description: t(customMessage),
      placement: 'topLeft',
    });
  };
  const validateMessages = {
    required: t('form.invalidInput'),
    types: {
      email: t('email.invalidMessage'),
    },
  };



  //DataManager Handles
  const handleGetEmployeeByIdentifier = async (identifierValue: string): Promise<Pointer | null> => {
    try {
      return await dataManager.getClockInEmployeeByIdentifier(
        operationToken,
        identifierValue
      );
    } catch (error) {
      throw new Error("Problème lors de la récupération d'une personne.");
    }
  };
  const handleMakeClockIn = async (operationToken: string, clockInEmployeeID: string, fieldValues: any) => {
    try {
      await dataManager.makeClockIn(operationToken, clockInEmployeeID, fieldValues);
    } catch (error) {
      handleErrorResponse(Error("Problème lors du pointage"), 'error_description');
    }
  };
  const handleCreateClockInEmployee = async (operationToken: string, identifierValue: string, values: any) => {
    try {
      return await dataManager.createClockInEmployee(operationToken, identifierValue, values);
    } catch (error) {
      handleErrorResponse(Error("Problème lors de l'inscription"), 'error_description');
    }
  };




  // Form validation
  const handleFirstStep = async (values: any) => {
    const identifierFields = fields?.filter((field: any) => field.isUnique);
    if (!identifierFields || identifierFields.length !== 1) {
      handleErrorResponse(new Error("Problème de définition des champs."), 'error_description');
      return;
    }

    const newIdentifierValue = values[identifierFields[0].id];
    setIdentifierValue(newIdentifierValue);
    setFirstStepValues(values);

    try {
      const res = await handleGetEmployeeByIdentifier(newIdentifierValue);
      if (res) {
        await handleMakeClockIn(operationToken, newIdentifierValue, values);
        setStep(3);
      } else {
        let nextStep = 2;

        // If no fields in 2nd step, create employee & clockIn & redirect directly step 3
        if (fields && fields.length === Object.keys(values).length) {
          await handleCreateClockInEmployee(operationToken, newIdentifierValue, values).then();
          await handleMakeClockIn(operationToken, newIdentifierValue, values);
          nextStep = 3;
        }

        setStep(nextStep);
      }
    } catch (error) {
      handleErrorResponse(error, 'error_description');
    }
  };


  const handleSecondStep = async (values: any) => {
    const employeeValues = { ...firstStepValues, ...values };
    const clockInEmployee = await handleCreateClockInEmployee(operationToken, identifierValue, employeeValues);
    if (clockInEmployee) {
      await handleMakeClockIn(operationToken, identifierValue, firstStepValues);
      setStep(3);
    }
  };

  const handleSubmitForm = async (values: any) => {
    try {
      if (step === 1) {
        await handleFirstStep(values);
      } else if (step === 2) {
        await handleSecondStep(values);
      }
    } catch (error) {
      handleErrorResponse(error, 'error_description');
    }
  };

  const { mutate, isLoading } = useMutation(handleSubmitForm);






  // Render Input Fields
  const getFields = async () => {
    const fields = await dataManager.getFields(operationToken);

    return fields.map((field, i) => {
      return Object.assign(field, { required: true, type: getType(field.type), key: i });
    });
  };
  const {
    data: fields,
    isFetching,
    refetch,
  } = useQuery(['operations'], getFields, {
    onError: (e) => {
      console.error(e);
    },
    refetchOnWindowFocus: false,
  });

  if (isFetching) {
    return <div>Loading...</div>;
  }

  const renderFields = (fields: any, step: number) => {
    if (step === 1) {
      return (
        <>
          {fields
            .filter((field: any) => field.allwaysFill === true)
            .map(renderFormField)}

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className='ant-btn ant-btn-secondary ant-btn-sm'>
            Valider
          </Button>
        </>
      );
    } else if (step === 2) {
      return (
        <>
          <p>Vous ne devrez remplir ce second formulaire qu'une seule fois. Lors de votre prochaine visite, cette étape sera déjà prise en charge.</p>
          {fields
            .filter((field: any) => field.allwaysFill === false)
            .map(renderFormField)}
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className='ant-btn ant-btn-default ant-btn-sm'>
            S'inscrire
          </Button>
        </>
      )


    } else {
      return (
        <>
          <p>Votre pointage a été enregistré avec succès. Merci pour votre présence et votre implication. </p>
          <Button
            onClick={() => window.location.reload()}
            type="primary"
            className='ant-btn ant-btn-secondary ant-btn-sm'>
            Recommencer
          </Button>
        </>
      );
    }
  };
  const renderFormField = (field: any, index: any) => {
    switch (field.type) {
      case 'checkbox':
        return (
          <Form.Item name={field['id']} style={{ textAlign: 'left' }} key={index} label={field.label} valuePropName="checked" rules={[{ required: field.isRequired, type: field.type }]}>
            <Checkbox>{field.label}</Checkbox>
          </Form.Item>
        );
      case 'radio':
        return (
          <Form.Item name={field['id']} label={field.label} key={index} rules={[{ required: field.isRequired, type: field.type }]}>
            <Radio.Group>
              {field.options.map((option: any, idx: any) => (
                <Radio key={idx} value={option.value}>{option.label}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );
      case 'textarea':
        return (
          <Form.Item name={field['id']} label={field.label} key={index} rules={[{ required: field.isRequired, type: field.type }]}>
            <TextArea rows={4} placeholder={field.label} />
          </Form.Item>
        );
      case 'date':
        return (
          <Form.Item name={field['id']} label={field.label} key={index} rules={[{ required: field.isRequired, type: field.type }]}>
            <DatePicker format="DD/MM/YYYY" className='custom-datepicker' placeholder={field.label} />
          </Form.Item>
        );
      case 'datetime':
        return (
          <Form.Item name={field['id']} label={field.label} key={index} rules={[{ required: field.isRequired, type: field.type }]}>
            <DatePicker showTime showMinute format="DD/MM/YYYY HH:mm" className='custom-datepicker' placeholder={field.label} />
          </Form.Item>
        );
      case 'range':
        return (
          <Form.Item name={field['id']} label={field.label} key={index} rules={[{ required: field.isRequired, type: field.type }]}>
            <Slider className='custom-datepicker' />
          </Form.Item>
        );
      default:
        return (
          <Form.Item name={field['id']} label={field.label} key={index} rules={[{ required: field.isRequired, type: field.type }]}>
            <Input
              //defaultValue={"a@gmail.com"}
              placeholder={field.label}
              className='form-control form-control-lg focused bg-white mb-3 input-with-value'
              type={field.type}
            />
          </Form.Item>
        );
    }
  };





  return (
    <section className="vh-100 login" style={{ backgroundColor: '#1E1C22 !important' }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-2-strong" style={{ borderRadius: '1rem' }}>
              <div className="card-body p-5 text-center">

                {step === 2 && (
                  <div className='form-come-back' onClick={() => setStep(1)}>
                    <LeftOutlined style={{ position: 'relative', top: '-4px', fontSize: '1rem' }} /> Retour
                  </div>
                )}

                <img style={{ height: '60px' }} src="/images/logo.svg" alt="Logo de QR4You"></img>

                <h3 className='mt-2 title-txt'>
                  {step === 1 && 'Pointage'}
                  {step === 2 && 'Enregistrement'}
                  {step === 3 && 'Pointage effectué'}
                </h3>
                <Card>
                  <Form
                    form={form}
                    onFinish={(values: any) => {
                      mutate(values);
                    }}
                    validateMessages={validateMessages}
                    layout='vertical'
                  >
                    {renderFields(fields, step)}

                  </Form>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section >
  );
};

export default withTranslation(withDataManager(PointerPage));
