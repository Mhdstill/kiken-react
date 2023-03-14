import React from 'react';
import { Form, FormInstance, Input, Select } from 'antd';
import type { WithTranslation } from 'react-i18next';
import { useKeyPressEvent } from 'react-use';

import withTranslation from '../../hoc/withTranslation';

import './ModalForm.less';

type Input = {
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
                return (
                  <Option key={key} value={value.id}>
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
        } else {
          component = (
            <Input key={index} placeholder={t(`form.${input.name}`)} />
          );
        }
        return (
          <Form.Item
            key={index}
            name={input.name}
            rules={[{ required: true, ...rules }]}
            initialValue={input.possibleValues ? input.values : input.value}
          >
            {component}
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default withTranslation(ModalForm);
