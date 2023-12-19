import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Button, Dropdown, Empty, Table } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import type { FilterValue, SorterResult } from 'antd/lib/table/interface';
import type { WithTranslation } from 'react-i18next';

import Modal from '../Modal';
import withTranslation from '../../hoc/withTranslation';
import { useTablePageSize } from '../../hooks/useTablePageSize';

import '../../style.less';

interface TableViewProps extends WithTranslation {
  title?: string | undefined | null;
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
  const [paddingTop, setPaddingTop] = useState(0);

  useEffect(() => {
    if (props.data) {
      setPaddingTop(props.data.length > pageSize ? 0 : 0);
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
      setPaddingTop(0);
    }
  };

  const exportToCSV = () => {
    console.log("export");
  }



  return (
    <div className="table-container">
      {props.title ? (
        <div role="tablist" className="ant-tabs-nav">
          <div className="ant-tabs-nav-wrap">
            <div className="ant-tabs-nav-list" style={{ transform: 'translate(0px, 0px)' }}>
              <div className="ant-tabs-tab ant-tabs-tab-active">
                <div className="ant-tabs-tab-btn" id="rc-tabs-0-tab-operations">
                  <span> {props.title} </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null
      }

      {
        /*
        props.actionsItems && props.actionsItems.length > 0 && (
          <Dropdown
            className="actions-container float-right"
            menu={{ items: props.actionsItems }}
            trigger={['click']}
          >
            <Button size="small" icon={<PlusOutlined />}>
              Actions
            </Button>
          </Dropdown>
        )
      */

        <Dropdown
          className="actions-container float-right"
          menu={{
            items: [
              ...(props.actionsItems || []),
              {
                label: (
                  <>
                    <DownloadOutlined /> Exporter tableau
                  </>
                ),
                key: 'export',
                onClick: exportToCSV,
              }
            ],
          }}
          trigger={['click']}
        >
          <Button size="small" icon={<PlusOutlined />}>
            Actions
          </Button>
        </Dropdown>

      }
      <Table
        style={{ paddingTop }}
        columns={props.columns}
        dataSource={props.data}
        scroll={{ x: '100%' }}
        loading={props.isFetching}
        pagination={{
          pageSize: pageSize,
          hideOnSinglePage: true,
          position: ['bottomRight'],
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