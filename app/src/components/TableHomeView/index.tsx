import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Button, Dropdown, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import type { FilterValue, SorterResult } from 'antd/lib/table/interface';
import type { WithTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import {
  useNavigate,
} from 'react-router-dom';
import Modal from '../Modal';
import withTranslation from '../../hoc/withTranslation';
import { useTablePageSize } from '../../hooks/useTablePageSize';

import '../../style.less';
import SearchBar from '../Searchbar';

interface TableViewProps extends WithTranslation {
  data: any[] | undefined;
  tree: any[] | undefined;
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
  setCurrentPageKeys?: any | null;

}

const TableHomeView: FC<TableViewProps> = (props) => {
  const pageSize = useTablePageSize(props.minusTabSize ? 46 : 0);
  const [paddingTop, setPaddingTop] = useState(0);
  const [filteredData, setFilteredData] = useState<any[] | undefined>(props.data);
  const [tree, setTree] = useState<any[] | undefined>(props.tree);
  const navigate = useNavigate();

  useEffect(() => {
    if (props.data) {
      setPaddingTop(props.data.length > pageSize ? 0 : 0);
      setFilteredData(props.data);

      const initialPageData = props.data.slice(0, 10);
      props.setCurrentPageKeys(initialPageData);
    }
    if (props.tree) {
      setTree(props.tree);
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

    
    const currentPage = pagination.current || 1;
    const startIndex = (currentPage - 1) * 10;
    const endIndex = currentPage * 10;

    const currentPageData = filteredData?.slice(startIndex, endIndex) || [];
    props.setCurrentPageKeys(currentPageData);
  };

  const handleSearch = (searchText: string) => {
    if (!props.data) return; // Add a guard check for props.data

    const filtered = props.data?.filter(item => {
      const allFieldValues = Object.values(item).join(' ').toLowerCase();
      return allFieldValues.includes(searchText.toLowerCase());
    });

    setFilteredData(filtered);
  };


  return (
    <div className="table-container">
      {props.actionsItems && props.actionsItems.length > 0 && (
        <Dropdown
          className="actions-container float-right"
          menu={{ items: props.actionsItems }}
          trigger={['click']}
        >
          <Button size="small" icon={<PlusOutlined />}>
            Actions
          </Button>
        </Dropdown>
      )}

      <div className="input-group input-group-outline mb-3">
        <SearchBar onChange={(e: any) => handleSearch(e.target.value)} />
      </div>

      {tree && tree.length > 0 && (
        <div className='row mb-2'>
          <div className='col'>
            <div className='c-card d-flex align-items-center w-100 p-2' style={{overflow: 'hidden'}}>
              <FontAwesomeIcon icon={faFolder} style={{ fontSize: "18px" }} className='me-2' />
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "16px" }} className='me-2' />
              {tree.map((value, key) => (
                <React.Fragment key={key}>
                  <span className={`arbo-name me-2 ${key === tree.length - 1 ? 'active' : ''}`}
                    onClick={key < tree.length - 1 ? () => navigate(value["@id"].replace("/api", "").replace("folders", "folder")) : undefined}
                  >
                    {value.name}
                  </span>
                  {key < tree.length - 1 && ( // Vérifie si c'est le dernier élément du tableau
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "16px" }} className='me-2' />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}


      <Table
        style={{ paddingTop }}
        columns={props.columns}
        dataSource={filteredData}
        scroll={{ x: '100%' }}
        loading={props.isFetching}
        /* pagination={{
           pageSize: pageSize,
           hideOnSinglePage: true,
           position: ['topRight'],
         }} */
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

export default withTranslation(TableHomeView);