import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';

export const useConvexQuery = (query, ...args) => {
    const response = useQuery(query, ...args);

    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (response === undefined) {
            setLoading(true);
        } else {
            try {
                setData(response);
                setError(null);
            } catch (error) {
                setError(error);
                toast.error(error?.message || 'Error fetching data');
            } finally {
                setLoading(false);
            }
        }
    }, [response]);

    return { data, loading, error };
};

export const useConvexMutation = mutation => {
    const mutationFunction = useMutation(mutation);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const result = await mutationFunction(...args);
            setData(result);
            return result;
        } catch (error) {
            setError(error);
            toast.error(error?.message || 'Error performing mutation');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { mutate, data, loading, error };
};
