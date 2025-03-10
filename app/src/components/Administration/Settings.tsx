import React, { FC, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { WithTranslation } from 'react-i18next';
import withTranslation from '../../hoc/withTranslation';
import withDataManager, {
    WithDataManagerProps,
} from '../../hoc/withDataManager';
import './style.less';
import FormView, { FormViewSection } from '../FormView';
import { FileAction, PointerAction, isAuthorized } from '../../services/auth/auth';
import { showSuccesNotification } from '../../services/utils';
import { API_URL } from '../../services/utils';

const SettingsPage: FC = ({
    dataManager,
    t,
}: WithTranslation & WithDataManagerProps) => {

    var ptAuth = Object.values(PointerAction).find((action) =>
        isAuthorized(action)
    );
    var qrdAuth = Object.values(FileAction).find((action) =>
        isAuthorized(action)
    );
    const operationToken = localStorage.getItem('operation_token');
    const getOperation = async () => {
        if (!operationToken) {
            throw new Error("Pas de token d'opération disponible");
        }

        try {
            return await dataManager.getOperation(operationToken);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'opération :", error);
            throw error;
        }
    };

    const { data: operation, isFetching, refetch } = useQuery(['operations', operationToken], getOperation, {
        onError: (error) => {
            console.error("Erreur lors de la requête de l'opération :", error);
        },
        refetchOnWindowFocus: false,
        enabled: !!operationToken, // N'exécutez la requête que si operationToken existe
        refetchInterval: 4000, // Mise à jour toutes les 5 secondes
        refetchIntervalInBackground: true,
    });



    // Form Events
    const [sections, setSections] = useState<FormViewSection[]>([]);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmitGeneralForm = async (values: any) => {
        if (!operationToken) {
            return;
        }

        const operation = await dataManager.updateOperation(operationToken, {
            street: values.street,
            zip: parseInt(values.zip),
            city: values.city,
            logo: file
        })
        if(!file){
        //    await dataManager.deleteGeneralFile(operation.id,  operation.logo)
        }

        showSuccesNotification('settingsUpdated', t);
        return operation;
    };

    const handleSubmitClockInForm = async (values: any) => {
        if (!operationToken) {
            return;
        }

        try {
            const datas = await dataManager.updateOperation(operationToken, {
                useClockInGeolocation: values.useClockInGeolocation,
                distance: values.distance,
                isDarkMode: values.theme === '2' ? true : false
            })
            showSuccesNotification('settingsUpdated', t);
            return datas;
        } catch (error) {
            throw new Error(error);
        }
    };


    // Sections Render

    const handleFileChange = (fieldName: string, file: File | null) => {
        setFile(file);
    };
    useEffect(() => {
        const newSections: FormViewSection[] = [
            {
                title: 'General',
                subtitle: 'Configurez les éléments fondamentaux et les réglages principaux de votre opération pour un contrôle optimal.',
                inputs: [
                    {
                        name: 'street',
                        type: 'text',
                        label: 'Adresse',
                    },
                    {
                        name: 'zip',
                        type: 'number',
                        label: 'Code Postal',
                    },
                    {
                        name: 'city',
                        type: 'text',
                        label: 'Ville',
                    },
                    {
                        name: 'file',
                        type: 'file',
                        label: 'Logo',
                        options: {
                            onChange: handleFileChange,
                            initialFile: operation && operation.logo ? <img className='mt-4' style={{maxHeight: "200px"}} src={API_URL + "/images/" + operation.logo.path} /> : <></>
                        }
                    },
                ],
                onSubmit: (values) => handleSubmitGeneralForm(values),
                initialValues: {
                    street: operation && operation.address ? operation.address.street : undefined,
                    zip: operation && operation.address ? operation.address.zip : undefined,
                    city: operation && operation.address ? operation.address.city : undefined,
                    file: operation ? operation.logo : undefined
                },
            },
        ];

        if (ptAuth) {
            newSections.push({
                title: 'QR Form',
                subtitle: 'Déterminez la structure, la gestion et les interactions utilisateur de vos formulaires pour une expérience personnalisée.',
                inputs: [
                    {
                        name: 'useClockInGeolocation',
                        type: 'checkbox',
                        label: 'Géolocalisation',
                        options: {
                            content: 'Je souhaite vérifier la géolocalisation lors de la validation du formulaire'
                        },
                    },

                    {
                        name: 'distance',
                        type: 'range',
                        label: 'Distance (km)',
                        options: {
                            'max': 10
                        },
                    },

                    {
                        name: 'theme',
                        type: 'radio',
                        label: 'Couleur',
                        choices: [
                            {
                                value: "1",
                                label: "Thème Clair"
                            },
                            {
                                value: "2",
                                label: "Thème Sombre"
                            },
                        ]
                    },
                ],
                initialValues: {
                    useClockInGeolocation: operation ? operation.useClockInGeolocation : false,
                    distance: operation ? operation.distance : 0,
                    theme: operation && operation.isDarkMode ? "2" : "1"
                },
                onSubmit: handleSubmitClockInForm
            });
        }

        setSections(newSections);
    }, [operation, ptAuth, file]);


    return (
        <FormView sections={sections} />
    );
};

export default withTranslation(withDataManager(SettingsPage));