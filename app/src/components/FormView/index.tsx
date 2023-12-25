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
import FormItem, { FormItemProps } from '../FormItem';

interface FormViewProps extends WithTranslation, WithDataManagerProps {
    sections: FormViewSection[];
}

export interface FormViewSection {
    inputs?: FormItemProps[];
    title?: string | null;
    subtitle?: string | null;
    onSubmit?: (values: any) => any | null;
    initialValues?: any | null;
}
const SectionForm: FC<{ section: FormViewSection }> = ({ section }) => {
    const [form] = Form.useForm();
    
    useEffect(() => {
        form.resetFields(); 
    }, [section.initialValues, form]);

    return (
        <Form
            form={form}
            onFinish={async (values) => {
                if (section.onSubmit) {
                    console.log("Appel de onSubmit de la section: ", section.title);
                    await section.onSubmit(values);
                }
            }}
            initialValues={section.initialValues}
        >
            {section.inputs && section.inputs.map((input, inputKey) => (
                <FormItem
                    key={inputKey}
                    name={input.name}
                    type={input.type}
                    label={input.label}
                    isRequired={input.isRequired}
                    options={input.options}
                />
            ))}
            {section.onSubmit && (
                <Button type="primary" htmlType="submit" className='ant-btn ant-btn-secondary ant-btn-sm' style={{ float: 'right' }}>
                    Valider
                </Button>
            )}
        </Form>
    );
};


const FormView: FC<FormViewProps> = ({ sections }) => {
    return (
        <div className='form-section'>
            {sections.map((section, key) => (
                <Card key={key} className='ant-shadow ant-radius mb-3'>
                    {section.title && <h3 className="section-title">{section.title}</h3>}
                    {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
                    <SectionForm section={section} />
                </Card>
            ))}
        </div>
    );
};




export default withTranslation(withDataManager(FormView));