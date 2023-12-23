import React from 'react';
import { Checkbox, Form, FormInstance, Input, Select } from 'antd';
import type { WithTranslation } from 'react-i18next';
import { useKeyPressEvent } from 'react-use';

import withTranslation from '../../hoc/withTranslation';

import './ModalForm.less';

type Input = {
  type?: string;
  name: string;
  value?: string;
  possibleValues?: any[];
  values?: any[];
  multiple?: boolean;
};

interface ModalFormProps extends WithTranslation {
  inputs: Input[];
  onFormValueChange: (changedValues: any, allValues: any) => void;
  submit: (form: FormInstance) => void;
}

const { Option } = Select;

const ModalForm = ({
  t,
  inputs,
  onFormValueChange,
  submit,
}: ModalFormProps) => {
  const validateMessages = {
    required: t('form.invalidInput'),
    types: {
      email: t('email.invalidMessage'),
    },
  };

  const [form] = Form.useForm();

  useKeyPressEvent('Enter', () => submit(form));

  return (
    <Form
      form={form}
      className="modal-form"
      preserve={false}
      onValuesChange={onFormValueChange}
      validateMessages={validateMessages}
    >
      {inputs.map((input, index) => {
        let component;
        let rules: any = {};
        if (input.possibleValues) {
          component = (
            <Select
              key={index}
              placeholder={t(`form.${input.name}`)}
              mode={input.multiple === false ? undefined : 'multiple'}
              allowClear
            >
              {input.possibleValues.map((value, key) => {
                const isSelected = input.values && input.values.some(v => v.id === value.id);
                return (
                  <Option key={key} value={value.id} selected={isSelected}>
                    {value.label}
                  </Option>
                );
              })}
            </Select>
          );
        } else if (input.name === 'password') {
          component = (
            <Input.Password key={index} placeholder={t('password')} />
          );
        } else if (input.name === 'email') {
          component = <Input key={index} placeholder={t('email.label')} />;
          rules.type = 'email';
        } else if (input.type === 'checkbox') {
          component = <Checkbox key={index}>{t(`form.${input.name}`)}</Checkbox>
          rules.type = 'checkbox';
        } else {
          component = (
            <Input key={index} placeholder={t(`form.${input.name}`)} />
          );
        }
        return (
          <Form.Item
            className='input-with-value'
            key={index}
            name={input.name}
            rules={[{ required: true, ...rules }]}
            initialValue={input.values ? input.values : input.value}
            valuePropName={input.type && input.type === "checkbox" ? "checked" : undefined}
          >
            {component}
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default withTranslation(ModalForm);
