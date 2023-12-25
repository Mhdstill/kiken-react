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
    const operationToken = sessionStorage.getItem('operation_token');
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
    });



    // Form Events
    const handleSubmitGeneralForm = async (values: any) => {
        if (!operationToken) {
            return;
        }
        const datas = await dataManager.updateOperation(operationToken, {
            street: values.street,
            zip: parseInt(values.zip),
            city: values.city
        })
        showSuccesNotification('settingsUpdated', t);
        return datas;
    };

    const handleSubmitClockInForm = async (values: any) => {
        if (!operationToken) {
            return;
        }

        try {
            const datas = await dataManager.updateOperation(operationToken, {
                useClockInGeolocation: values.useClockInGeolocation,
                distance: values.distance
            })
            showSuccesNotification('settingsUpdated', t);
            return datas;
        } catch (error) {
            throw new Error("Problème lors de la mise à jour de vos paramètres.");
        }
    };


    // Sections Render
    const [sections, setSections] = useState<FormViewSection[]>([]);
    useEffect(() => {
        const newSections: FormViewSection[] = [
            {
                title: 'General',
                subtitle: 'Veuillez entrer les informations générales au projet',
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
                ],
                onSubmit: handleSubmitGeneralForm,
                initialValues: {
                    street: operation && operation.address ? operation.address.street : undefined,
                    zip: operation && operation.address ? operation.address.zip : undefined,
                    city: operation && operation.address ? operation.address.city : undefined,
                },
            },
        ];

        if (ptAuth) {
            newSections.push({
                title: 'Pointer',
                subtitle: 'Veuilelz',
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
                ],
                initialValues: {
                    useClockInGeolocation: operation ? operation.useClockInGeolocation : false,
                    distance: operation ? operation.distance : 0
                },
                onSubmit: handleSubmitClockInForm
            });
        }

        setSections(newSections);
    }, [operation, ptAuth]);


    return (
        <FormView sections={sections} />
    );
};

export default withTranslation(withDataManager(SettingsPage));