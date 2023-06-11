const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const getUrl = (route) => `${BACKEND_URL}api/${route}`;
