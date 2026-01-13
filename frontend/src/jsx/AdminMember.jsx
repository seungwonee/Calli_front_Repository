import React, { useState, useEffect } from 'react';
import '../css/Admin.css';

export default function AdminMember() {
    // 가상의 초기 데이터 생성 (다양한 날짜)
    const generateMockUsers = () => {
        const today = new Date();
        const users = [];

        // Helper to format date
        const formatDate = (date) => date.toISOString().split('T')[0];

        // Helper to subtract days
        const subDays = (days) => {
            const d = new Date();
            d.setDate(d.getDate() - days);
            return formatDate(d);
        };

        // 1. 정상 회원들
        users.push({ id: 1, userId: 'user1', email: 'user1@example.com', lastLogin: subDays(1) });
        users.push({ id: 2, userId: 'calligraphy_lover', email: 'love@calli.com', lastLogin: subDays(5) });
        users.push({ id: 3, userId: 'happy_day', email: 'happy@gmail.com', lastLogin: subDays(30) });
        users.push({ id: 4, userId: 'design_pro', email: 'pro@design.net', lastLogin: subDays(89) }); // 휴면 직전

        // 2. 휴면 회원들 (90일 이상)
        users.push({ id: 5, userId: 'ghost_user', email: 'ghost@naver.com', lastLogin: subDays(90) }); // 딱 90일
        users.push({ id: 6, userId: 'long_time_no_see', email: 'long@daum.net', lastLogin: subDays(120) });
        users.push({ id: 7, userId: 'forgot_pw', email: 'forgot@nate.com', lastLogin: subDays(365) });

        return users;
    };

    const [users, setUsers] = useState(generateMockUsers);

    // 미접속 일수 및 상태 계산 함수
    const calculateStatus = (lastLoginStr) => {
        const today = new Date();
        const lastLogin = new Date(lastLoginStr);
        // 밀리초 차이 -> 일수 변환
        const diffTime = Math.abs(today - lastLogin);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const isDormant = diffDays >= 90;

        return { diffDays, isDormant };
    };

    return (
        <div className="admin-inquiry-container">
            {/* 이 컨테이너 스타일을 재사용 (흰 배경, 그림자 등) */}
            <div className="inquiry-table-wrapper" style={{ marginTop: 0 }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th width="50">No</th>
                            <th width="100">회원 아이디</th>
                            <th width="200">이메일</th>
                            <th width="80">최종 접속일</th>
                            <th width="80">미접속 일수</th>
                            <th width="60">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const { diffDays, isDormant } = calculateStatus(user.lastLogin);

                            return (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.userId}</td>
                                    <td>{user.email}</td>
                                    <td>{user.lastLogin}</td>
                                    <td style={{ color: isDormant ? '#fa5252' : '#868e96', fontWeight: isDormant ? 'bold' : 'normal' }}>
                                        {diffDays}일
                                    </td>
                                    <td>
                                        <span className={`status-badge ${isDormant ? 'badge-waiting' : 'badge-completed'}`}>
                                            {isDormant ? '휴먼' : '정상'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
