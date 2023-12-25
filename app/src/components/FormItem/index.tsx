import React from 'react';
import { Form, Input, Checkbox, Radio, DatePicker, Slider } from 'antd';
import { Key } from 'antd/lib/table/interface';

const { TextArea } = Input;

export interface FormItemProps {
    name: string;
    type: any;
    label?: string | undefined;
    isRequired?: boolean | undefined;
    choices?: { value: string; label: string }[] | undefined; //For select, radio, etc..
    options?: { content?: string | null, min?: number | undefined, max?: number | undefined } //Special options
}

const FormItem: React.FC<FormItemProps> = ({ name, type, label, isRequired, choices, options }) => {

    const key = 1;

    const renderFormField = () => {
        switch (type) {
            case 'checkbox':
                return (
                    <Form.Item name={name} style={{ textAlign: 'left' }} key={key} label={label} valuePropName="checked" rules={[{ required: isRequired ? isRequired : false, type: type }]}>
                        <Checkbox>{options && options.content ? options.content : label}</Checkbox>
                    </Form.Item>
                );
            case 'radio':
                return (
                    <Form.Item name={name} label={label} key={key} rules={[{ required: isRequired ? isRequired : false, type: type }]}>
                        <Radio.Group>
                            {choices && choices.map((choice: any, idx: any) => (
                                <Radio key={idx} value={choice.value}>{choice.label}</Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                );
            case 'textarea':
                return (
                    <Form.Item name={name} label={label} key={key} rules={[{ required: isRequired ? isRequired : false, type: type }]}>
                        <TextArea rows={4} placeholder={label ? label : ''} />
                    </Form.Item>
                );
            case 'date':
                return (
                    <Form.Item name={name} label={label} key={key} rules={[{ required: isRequired ? isRequired : false, type: type }]}>
                        <DatePicker format="DD/MM/YYYY" className='custom-datepicker' placeholder={label ? label : ''} />
                    </Form.Item>
                );
            case 'datetime':
                return (
                    <Form.Item name={name} label={label} key={key} rules={[{ required: isRequired ? isRequired : false, type: type }]}>
                        <DatePicker showTime showMinute format="DD/MM/YYYY HH:mm" className='custom-datepicker' placeholder={label ? label : ''} />
                    </Form.Item>
                );
            case 'range':
                return (
                    <Form.Item name={name} label={label} key={key} rules={[{ required: isRequired ? isRequired : false, type: type }]}>
                        <Slider className='custom-datepicker' min={options && options.min ? options.min : undefined} max={options && options.max ? options.max : undefined} />
                    </Form.Item>
                );
            case 'number':
                return (
                    <Form.Item name={name} label={label} key={key} rules={[{ required: isRequired ? isRequired : false }]}>
                        <Input
                            placeholder={label ? label : ''}
                            className='form-control form-control-lg focused bg-white mb-3 input-with-value'
                            type="number"
                        />
                    </Form.Item>
                );
            default:
                return (
                    <Form.Item name={name} label={label} key={key} rules={[{ required: isRequired ? isRequired : false, type: type }]}>
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
