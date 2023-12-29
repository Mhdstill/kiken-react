import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Button, Dropdown, Empty, Select, Table } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import type { FilterValue, SorterResult } from 'antd/lib/table/interface';
import type { WithTranslation } from 'react-i18next';

import Modal from '../Modal';
import withTranslation from '../../hoc/withTranslation';
import { useTablePageSize } from '../../hooks/useTablePageSize';

import '../../style.less';
import * as XLSX from 'xlsx';
import SearchBar from '../Searchbar';
import { getTypeString } from '../../types/PointerField';
import Module from '../../types/Module';
import { getFormattedDate } from '../../services/utils';
import { CustomColumnType } from '../../types/CustomColumnsType';
import { Option } from 'antd/lib/mentions';

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

  const exportToXLSX = () => {

    if (!props.data) {
      console.error("Aucune donnée disponible pour l'exportation.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(props.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données Exportées");

    XLSX.writeFile(wb, "donnees_exportees.xlsx");
  }


  // Filters : Search Bar
  const [searchText, setSearchText] = useState('');
  const [filterSelections, setFilterSelections] = useState<Record<string, string[]>>({});

  const handleSearchChange = (event: any) => {
    setSearchText(event.target.value);
  };
  const filterableColumnKeys = props.columns
    .filter(column => column.key !== 'actions' && typeof column.key === 'string') // S'assurer que key est une chaîne de caractères
    .map(column => column.key);

  const transformValueForFiltering = (key: any, value: any) => {

    if (typeof value === 'boolean') {
      return value ? "Oui" : "Non";
    }

    if (key === 'type') {
      return getTypeString(value);
    }

    if (key === 'modules') {
      let newValue = '';
      value.forEach((module: Module) => {
        newValue += " " + module.name;
      });

      return newValue;
    }

    if (key === 'createdAt' || key === 'updatedAt' || key === 'start') {
      return getFormattedDate(value);
    }

    return value;
  };

  const filteredData = props.data
    ? props.data.filter(item => {
      const isFilterMatch = Object.entries(filterSelections).every(([key, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) {
          return true;
        }
        const itemValue = item[key as keyof typeof item];
        const transformedItemValue = transformValueForFiltering(key, itemValue);
        return selectedValues.includes(transformedItemValue);
      });

      return isFilterMatch && filterableColumnKeys.some(key => {
        const rawValue = item[key as keyof typeof item];
        const transformedValue = transformValueForFiltering(key, rawValue);
        const stringValue = typeof transformedValue === 'string' || typeof transformedValue === 'number'
          ? transformedValue.toString()
          : '';
        return stringValue.toLowerCase().includes(searchText.toLowerCase());
      });
    })
    : [];



  // Filters : Select
  const getFilterValues = (data: any[] | undefined, key: string | undefined) => {
    if (!data || !key) return [];
    const values = new Set(data.map(item => transformValueForFiltering(key, item[key])));
    return Array.from(values);
  };
  const filterMenus = props.columns
    .filter((column: CustomColumnType<any>) => column.useFilter)
    .map((column: CustomColumnType<any>) => {
      const options = getFilterValues(props.data, column.key?.toString());
      return (
        <Select
          className='me-4'
          key={column.key}
          value={filterSelections[column.key as keyof typeof filterSelections] || ''}
          onChange={(value) => setFilterSelections({ ...filterSelections, [column.key as keyof typeof filterSelections]: value })}
          style={{ width: 120 }}
        >
          <Option value="">Tous</Option>
          {options.map((option, index) => (
            <Option key={`${column.key}-${index}`} value={option}>{option}</Option>
          ))}
        </Select>
      );
    });








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
              onClick: exportToXLSX,
            }
          ],
        }}
        trigger={['click']}
      >
        <Button size="small" icon={<PlusOutlined />}>
          Actions
        </Button>
      </Dropdown>

      <div className="filter-menus w-100 mx-auto d-block text-center">
        {filterMenus}
      </div>

      <div className="input-group input-group-outline mb-3">
        <div className="search-bar w-100">
          <SearchBar onChange={handleSearchChange} className="form-control form-control-lg focused bg-white mb-3 w-100 clicked" />
        </div>
      </div>


      <Table
        style={{ paddingTop }}
        columns={props.columns}
        dataSource={filteredData}
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