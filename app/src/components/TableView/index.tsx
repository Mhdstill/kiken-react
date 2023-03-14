import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Button, Dropdown, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import type { FilterValue, SorterResult } from 'antd/lib/table/interface';
import type { WithTranslation } from 'react-i18next';

import Modal from '../Modal';
import withTranslation from '../../hoc/withTranslation';
import { useTablePageSize } from '../../hooks/useTablePageSize';

import '../../style.less';

interface TableViewProps extends WithTranslation {
  data: any[] | undefined;
  isFetching: boolean;
  actionsItems: MenuProps['items'];
  columns: ColumnsType<any>;
  formData: any | null;
  setFormData: (data: any) => void;
  modalOnOkHandler: () => void;
  okText?: string;
  hideModalHandler: () => void;
  showModal: boolean;
  modalContent: ReactNode;
  minusTabSize?: boolean;
}

const TableView: FC<TableViewProps> = (props) => {
  const pageSize = useTablePageSize(props.minusTabSize ? 46 : 0);
  const [paddingTop, setPaddingTop] = useState(56);

  useEffect(() => {
    if (props.data) {
      setPaddingTop(props.data.length > pageSize ? 0 : 56);
    }
  }, [props.data, pageSize]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<any>,
    extra: { currentDataSource: []; action: any }
  ) => {
    if (extra.currentDataSource.length > pageSize) {
      setPaddingTop(0);
    } else {
      setPaddingTop(56);
    }
  };

  return (
    <div className="table-container">
      {props.actionsItems && props.actionsItems.length > 0 && (
        <Dropdown
          className="actions-container"
          menu={{ items: props.actionsItems }}
          trigger={['click']}
        >
          <Button size="small" icon={<PlusOutlined />}>
            {props.t('new')}
          </Button>
        </Dropdown>
      )}
      <Table
        style={{ paddingTop }}
        columns={props.columns}
        dataSource={props.data}
        scroll={{ x: '100%' }}
        loading={props.isFetching}
        pagination={{
          pageSize: pageSize,
          hideOnSinglePage: true,
          position: ['topRight'],
        }}
        locale={{ emptyText: props.t('nodata') }}
        size="middle"
        onChange={handleTableChange}
        showSorterTooltip={false}
      />
      <Modal
        showModal={props.showModal}
        onOk={() => props.modalOnOkHandler()}
        okText={props.okText}
        onCancel={props.hideModalHandler}
      >
        {props.modalContent}
      </Modal>
    </div>
  );
};

export default withTranslation(TableView);
