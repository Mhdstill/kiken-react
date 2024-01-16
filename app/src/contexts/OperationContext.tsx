import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Operation {
    id: string;
    name: string;
    // Ajoutez d'autres propriétés si nécessaire
}

interface OperationContextType {
    operationToken: string | null;
    setOperationToken: (token: string | null) => void;
    operations: Operation[];
    setOperations: (operations: Operation[]) => void;
}

const OperationContext = createContext<OperationContextType | undefined>(undefined);

export const useOperation = () => {
    const context = useContext(OperationContext);
    if (!context) {
        throw new Error('useOperation must be used within a OperationProvider');
    }
    return context;
};

interface OperationProviderProps {
    children: ReactNode;
}

export const OperationProvider: React.FC<OperationProviderProps> = ({ children }) => {
    const [operationToken, setOperationToken] = useState<string | null>(sessionStorage.getItem('operation_token'));
    const [operations, setOperations] = useState<Operation[]>([]);

    useEffect(() => {
        const token = sessionStorage.getItem('operation_token');
        if (token) {
            setOperationToken(token);
        }
        // Charger les opérations stockées en session si nécessaire
        const storedOperations = sessionStorage.getItem('operations');
        if (storedOperations) {
            setOperations(JSON.parse(storedOperations));
        }
    }, []);

    return (
        <OperationContext.Provider value={{ operationToken, setOperationToken, operations, setOperations }}>
            {children}
        </OperationContext.Provider>
    );
};