import type { ColumnType } from 'antd/lib/table';

export interface CustomColumnType<T> extends ColumnType<T> {
  useFilter?: boolean;
}

export type CustomColumnsType<T> = CustomColumnType<T>[];