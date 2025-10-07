import { useContext } from 'react';
import { APIContext } from './ApiContext';

const useAPIContext = () => {
    const apiContext = useContext(APIContext);

    if (apiContext === undefined) {
        throw new Error('useAPIContext must be used inside a APIProvider.');
    }

    return apiContext;
};

export default useAPIContext;
