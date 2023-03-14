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
    <div className="row mb-4">
      <div className="col-12">
        <div className="card">
          {/* 
          <div className="card-header pb-0">
            <div className="row">
             
              <div className="col-lg-6 col-5 my-auto text-end">
                <div className="dropdown float-lg-end pe-4">
                  <a className="cursor-pointer" id="dropdownTable" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa fa-ellipsis-v text-secondary" aria-hidden="true"></i>
                  </a>
                  <ul className="dropdown-menu px-2 py-3 ms-sm-n4 ms-n5" aria-labelledby="dropdownTable">
                    <li><a className="dropdown-item border-radius-md" href="javascript:;">Action</a>
                    </li>
                    <li><a className="dropdown-item border-radius-md" href="javascript:;">Another
                      action</a></li>
                    <li><a className="dropdown-item border-radius-md" href="javascript:;">Something
                      else here</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
                */}

          <div className="card-body px-0 py-1">
            <div className="table-responsive">
              <table className="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                      Nom
                    </th>
                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                      Créé le
                    </th>
                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                      Mis à jour le
                    </th>
                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                      Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="d-flex px-2 py-1">
                        <div>
                          <img src="https://material-dashboard-laravel-livewire.creative-tim.com/assets/img/small-logos/logo-xd.svg" className="avatar avatar-sm me-3" alt="xd" />
                        </div>
                        <div className="d-flex flex-column justify-content-center">
                          <h6 className="mb-0 text-sm">Material XD Version</h6>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle text-center text-sm">
                      <span className="text-xs font-weight-bold"> 14/03/2023 21h15 </span>
                    </td>
                    <td className="align-middle text-center text-sm">
                      <span className="text-xs font-weight-bold"> 14/03/2023 21h15 </span>
                    </td>
                    <td className="align-middle text-center">
                        <div className="dropdown pe-4">
                          <a className="cursor-pointer" id="dropdownTable" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="fa fa-ellipsis-v text-secondary" aria-hidden="true"></i>
                          </a>
                          <ul className="dropdown-menu px-2 py-3 ms-sm-n4 ms-n5" aria-labelledby="dropdownTable">
                            <li><a className="dropdown-item border-radius-md" href="javascript:;">Editer</a>
                            </li>
                            <li><a className="dropdown-item border-radius-md" href="javascript:;">Supprimer
                              action</a></li>
                          </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default withTranslation(TableView);
