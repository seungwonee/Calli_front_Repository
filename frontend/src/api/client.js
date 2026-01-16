import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:8083', // 백엔드 기본 포트
    withCredentials: true, // 세션 쿠키 전송을 위해 필수
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;
