import axios from 'axios';

const PESAPAL_BASE_URL = 'https://pay.pesapal.com/v3';
const CONSUMER_KEY = 'mpKh23p/UqoZsofcyIEZqo4B5RdViEBt';
const CONSUMER_SECRET = 'Ne5CHi53HhNhEpt4K88bgPR9a4I=';

async function testLiveKeys() {
    console.log('--- Testing Live PesaPal Keys ---');
    try {
        console.log('1. Fetching Token...');
        const authRes = await axios.post(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET
        });

        console.log('AUTH SUCCESS! Status:', authRes.status);
        const token = authRes.data.token;
        console.log('Token starts with:', token.substring(0, 10));

        console.log('\n2. Listing IPNs...');
        const ipnRes = await axios.get(`${PESAPAL_BASE_URL}/api/URLSetup/GetIPNList`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('IPN LIST SUCCESS!', ipnRes.data);

    } catch (error) {
        console.error('TEST FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLiveKeys();
