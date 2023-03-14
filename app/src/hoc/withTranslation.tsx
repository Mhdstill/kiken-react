import React from 'react';
import { useTranslation, WithTranslation } from 'react-i18next';

const withTranslation = <P extends WithTranslation>(
  WrappedComponent: React.ComponentType<P>
) => {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithTranslation = (props: Omit<P, keyof WithTranslation>) => {
    const { t } = useTranslation();

    return <WrappedComponent {...(props as P)} t={t} />;
  };

  ComponentWithTranslation.displayName = `withTranslation(${displayName})`;

  return ComponentWithTranslation;
};

export default withTranslation;
