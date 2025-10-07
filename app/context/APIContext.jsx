'use client';

import { createContext, useContext, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

const APIContext = createContext(undefined);
export default APIContext;

export const APIProvider = ({ children }) => {
    const { getToken } = useAuth();

    // Axios instance
    const axiosInstance = axios.create({
        baseURL: '/api', // point to your Next.js API routes
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add auth token to every request (if available)
    axiosInstance.interceptors.request.use(async config => {
        const token = await getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    const get = async (endpoint, queryParams = {}) => {
        const { data, status } = await axiosInstance.get(endpoint, { params: queryParams });
        return { data, status };
    };

    const jsonPost = async (endpoint, inputData) => {
        const { data, status } = await axiosInstance.post(endpoint, inputData);
        return { data, status };
    };

    const post = async (endpoint, inputData) => {
        const formData = getFormData(inputData);
        const { data, status } = await axiosInstance.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { data, status };
    };

    const put = async (endpoint, id = '', inputData) => {
        const formData = getFormData(inputData);
        const { data, status } = await axiosInstance.put(`${endpoint}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { data, status };
    };

    const jsonPut = async (endpoint, id = '', inputData) => {
        const { data, status } = await axiosInstance.put(`${endpoint}/${id}`, inputData);
        return { data, status };
    };

    const del = async (endpoint, id) => {
        const { data, status } = await axiosInstance.delete(`${endpoint}/${id}`);
        return { data, status };
    };

    const downloadExcel = async (endpoint, id) => {
        try {
            const { data } = await axiosInstance.get(`${endpoint}/${id || ''}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'data.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const getFormData = data => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value, value.name);
            } else if (Array.isArray(value)) {
                value.forEach(v => formData.append(key, v));
            } else if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });
        return formData;
    };

    const contextValue = useMemo(
        () => ({
            get,
            jsonPost,
            post,
            put,
            jsonPut,
            del,
            downloadExcel,
        }),
        []
    );

    return <APIContext.Provider value={contextValue}>{children}</APIContext.Provider>;
};
