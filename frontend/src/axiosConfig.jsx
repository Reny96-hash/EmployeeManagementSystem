import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://3.107.113.153:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
