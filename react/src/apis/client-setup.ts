import { client } from './client/client.gen';

client.setConfig({
    baseUrl: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.response.use(
    (response: { url: never; }) => {
        console.log('API Request Finished:', response.url);
        return response;
    },
    (error: never) => {
        console.error('API Network Error:' error);
        throw error;
    }
);

