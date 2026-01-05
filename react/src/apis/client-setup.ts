import { client } from './client/client.gen';

client.setConfig({
    baseUrl: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});



client.interceptors.response.use((response) => {
    console.log('API Request Finished:', response.url);
    // You must return the response to continue the chain
    return response;
});
