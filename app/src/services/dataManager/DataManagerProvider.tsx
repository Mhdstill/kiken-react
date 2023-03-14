import React, { createContext, FC } from 'react';
import { DataManager } from './DataManager';

type WithChildren<T = {}> = T & { children?: React.ReactNode };

export type ContextType = WithChildren<{
  dataManager?: DataManager;
}>;

export const DataManagerContext = createContext<ContextType>({});

const DataManagerProvider: FC<ContextType> = ({ dataManager, children }) => {
  return (
    <DataManagerContext.Provider value={{ dataManager }}>
      {children}
    </DataManagerContext.Provider>
  );
};

export default DataManagerProvider;
