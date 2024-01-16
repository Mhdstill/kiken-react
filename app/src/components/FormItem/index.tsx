import React, { useState } from 'react';
import { Form, Input, Checkbox, Radio, DatePicker, Slider } from 'antd';
import { Key } from 'antd/lib/table/interface';

const { TextArea } = Input;

export interface FormItemProps {
    name: string;
    type: any;
    label?: string | undefined;
    isRequired?: boolean | undefined;
    choices?: { value: string; label: string }[] | undefined;
    options?: {
        content?: string | null,
        min?: number | undefined,
        max?: number | undefined,
        getValueFromEvent?: any | undefined,
        onChange?: any | undefined,
        initialFile?: any | undefined
    }
}

const FormItem: React.FC<FormItemProps> = ({ name, type, label, isRequired, choices, options }) => {


    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const renderFormField = () => {
        switch (type) {
            case 'checkbox':
                return (
                    <Form.Item
                        {...(options && options.getValueFromEvent ? { getValueFromEvent: options.getValueFromEvent } : {})}
                        name={name}
                        style={{ textAlign: 'left' }}
                        label={label}
                        valuePropName="checked">
                        <Checkbox>{options && options.content ? options.content : label}</Checkbox>
                    </Form.Item>
                );
            case 'radio':
                return (
                    <Form.Item name={name} label={label} rules={[{ required: isRequired ? isRequired : false, type: type }]}>
                        <Radio.Group>
                            {choices && choices.map((choice: any, idx: any) => (
                                <Radio key={idx} value={choice.value}>{choice.label}</Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                );
            case 'textarea':
                return (
                    <Form.Item name={name} label={label} rules={[{ required: isRequired ? isRequired : false, message: 'Ce champ est obligatoire', type: type }]}>
                        <TextArea required={isRequired ? isRequired : false} rows={4} placeholder={label ? label : ''} />
                    </Form.Item>
                );
            case 'date':
                return (
                    <Form.Item name={name} label={label} rules={[{ required: isRequired ? isRequired : false }]}>
                        <DatePicker format="DD/MM/YYYY" className='custom-datepicker' placeholder={label ? label : ''} />
                    </Form.Item>
                );
            case 'datetime':
                return (
                    <Form.Item name={name} label={label} rules={[{ required: isRequired ? isRequired : false }]}>
                        <DatePicker showTime showMinute format="DD/MM/YYYY HH:mm" className='custom-datepicker' placeholder={label ? label : ''} />
                    </Form.Item>
                );
            case 'range':
                return (
                    <Form.Item
                        {...(options && options.getValueFromEvent ? { getValueFromEvent: options.getValueFromEvent } : {})}
                        name={name}
                        label={label}
                    >
                        <Slider className='custom-datepicker' min={options && options.min ? options.min : undefined} max={options && options.max ? options.max : undefined} />
                    </Form.Item>
                );
            case 'number':
                return (
                    <Form.Item name={name} label={label} rules={[{ required: isRequired ? isRequired : false }]}>
                        <Input
                            placeholder={label ? label : ''}
                            className='form-control form-control-lg focused bg-white mb-3 input-with-value'
                            type="number"
                            onKeyDown={(e) => {
                                if (!/[0-9]/.test(e.key) &&
                                    e.key !== "Backspace" &&
                                    e.key !== "Delete" &&
                                    e.key !== "ArrowLeft" &&
                                    e.key !== "ArrowRight" &&
                                    e.key !== "Enter" &&
                                    e.key !== "Tab") {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>
                );
            case 'file': // Nouveau cas pour le type 'file'
                return (
                    <Form.Item

                        label={label}
                    >
                        <input
                            name={name}
                            type="file"
                         //   accept=".svg" // Spécifiez les types de fichiers acceptés si nécessaire
                            onChange={(e) => {
                                const selected = e.target.files?.[0] || null; // Utilisez null si undefined
                                setSelectedFile(selected);
                                options?.onChange?.(name, selected)
                            }}
                        />
                        {options && options.initialFile && <>{options.initialFile}</>}
                    </Form.Item>
                );
            case 'phone':
                return (
                    <Form.Item
                        name={name}
                        label={label}

                        rules={[{
                            required: isRequired ? isRequired : false,
                            pattern: new RegExp(/(^[\d]+$)|(^\+[\d]+$)/), // Regex pour valider le format
                            message: 'Entrez un numéro de téléphone valide.' // Message d'erreur personnalisé
                        }]}
                    >
                        <Input
                            placeholder={label ? label : ''}
                            className='form-control form-control-lg focused bg-white mb-3 input-with-value'
                            onKeyDown={(e) => {
                                // Autoriser les chiffres, Backspace, Delete, les flèches gauche/droite, Tab, Enter et le signe +
                                if (!/[0-9]/.test(e.key) &&
                                    e.key !== "Backspace" &&
                                    e.key !== "Delete" &&
                                    e.key !== "ArrowLeft" &&
                                    e.key !== "ArrowRight" &&
                                    e.key !== "Tab" &&
                                    e.key !== "Enter" &&
                                    e.key !== "+") { // Autoriser le signe +
                                    e.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>
                );

            default:
                return (
                    <Form.Item name={name} label={label} rules={[{ required: isRequired ? isRequired : false }]}>
                        <Input
                            placeholder={label ? label : ''}
                            className='form-control form-control-lg focused bg-white mb-3 input-with-value'
                            type={type}

                        />
                    </Form.Item>
                );
        }
    };

    return renderFormField();
};

export default FormItem;
