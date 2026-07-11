// Configuration constants for VTRKM Web
export const BACKEND_URL = 'https://trading-backend-production-8cee.up.railway.app'; // client railway
export const BASE_URL = `${BACKEND_URL}/api`;
export const SOCKET_URL = BACKEND_URL;

export default {
    BASE_URL,
    SOCKET_URL,
    TIMEOUT: 10000,
};
