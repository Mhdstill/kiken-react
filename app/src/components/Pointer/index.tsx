import React, { FC, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Checkbox, DatePicker, Form, Input, notification, Radio, Row, Slider, Spin } from 'antd';
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
import { API_URL, checkUserProximity, getCoordinatesFromAddress } from '../../services/utils';
import FormItem from '../FormItem';
import Operation from '../../types/Operation';

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
  const [operation, setOperation] = useState<Operation | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = isDarkMode ? '/AppDarkMode.css' : '/AppLightMode.css';
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
    if (!identifierFields || identifierFields.length !== 1 || !identifierFields[0]) {
      handleErrorResponse(new Error("Problème de définition des champs."), 'error_description');
      return;
    }

    if (operation && operation.useClockInGeolocation && operation.address) {
      try {
        const coordinates = await getCoordinatesFromAddress({ street: operation.address.street, zip: operation.address.city, city: operation.address.zip });
        if (coordinates) {
          const hasProximity = await checkUserProximity(coordinates, (operation.distance) ? operation.distance * 1000 : 0);
          if (!hasProximity) {
            throw new Error('Vous devez être présent sur le lieu du QR Code pour pouvoir valider ce formulaire.')
          }
        } else {
          throw new Error("Impossible d'obtenir les coordonnées de l'adresse de l'opération");
        }
      } catch (error) {
        notification.error({
          message: 'Erreur',
          description: error.message,
          placement: 'topLeft',
        });
        return;
      }
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
    const operation = await dataManager.getOperation(operationToken);
    setIsDarkMode(operation.isDarkMode);
    setOperation(operation);
    const fields = operation.clockInFields;

    return fields.map((field: any, i: any) => {
      return Object.assign(field, { required: true, type: getType(field.type), key: i });
    });
  };
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const {
    data: fields,
    isFetching,
    refetch,
  } = useQuery(['operations'], getFields, {
    onSuccess: () => {
      if (isLoadingInitialData) {
        setIsLoadingInitialData(false);
      }
    },
    onError: (e) => {
      console.error(e);
    },
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });


  if (isFetching && isLoadingInitialData) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Chargement en cours...</p>
      </div>
    );
  }

  var initialValues: any = {};
  const renderLogo = () => {
    if (operation && operation.logo) {
      return (
        <img style={{ height: '60px' }} src={API_URL + "/images/" + operation.logo.path} alt="Logo"></img>
      )
    } else if (isDarkMode) {
      return (
        <img style={{ height: '60px' }} src={"/images/logo-qr4you-black.svg"} alt="Logo"></img>
      )
    } else {
      return (
        <img style={{ height: '60px' }} src={"/images/logo-qr4you.svg"} alt="Logo"></img>
      )
    }
  }
  const renderFormFields = (fields: any[], alwaysFill: boolean) => {
    const handleCheckboxChange = (e: any) => {
      return e.target.checked ? 'Oui' : 'Non';
    };
    const handleRangeChange = (value: number) => {
      return value.toString();
    };

    return fields
      .filter((field: any) => field.allwaysFill === alwaysFill)
      .map((field: any) => {
        let options = {};
        if (field.type === 'checkbox') {
          options = { content: field.label, getValueFromEvent: handleCheckboxChange };
          initialValues[field['id']] = false;
        } else if (field.type === 'range') {
          options = { getValueFromEvent: handleRangeChange };
          initialValues[field['id']] = '0';
        }

        const label = (field.type !== 'checkbox') ? field.label : '';
        return <FormItem name={field['id']} type={field.type} label={label} isRequired={field.isRequired} options={options} />;
      });
  };
  const renderFields = (fields: any, step: number) => {

    if (step === 1) {
      return (
        <>

          {renderFormFields(fields, true)}

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
          <p className='qr-form-subtitle'>Remplissez ce formulaire une seule fois. Vos informations seront sauvegardées pour les prochaines interactions.</p>
          {renderFormFields(fields, false)}
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
          <p className='qr-form-subtitle'>Vos informations ont été enregistrées avec succès. Nous vous remercions pour votre participation. </p>
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

                {renderLogo()}

                <h3 className='mt-2 title-txt'>
                  {step === 1 && 'Formulaire'}
                  {step === 2 && 'Complément'}
                  {step === 3 && 'Confirmation'}
                </h3>
                <Card>
                  <Form
                    form={form}
                    onFinish={(values: any) => {
                      mutate(values);
                    }}
                    validateMessages={validateMessages}
                    layout='vertical'
                    initialValues={initialValues}
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
