import React, { Children, useEffect, useState } from 'react'
import {Button} from  "@/components/ui/button"
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Auth from './pages/auth'
import Chat from './pages/chat'
import Profile from './pages/profile'
import { useAppStore } from './store'
import { apiClient } from './lib/api-client'
import { GET_USER_INFO } from './ultis/constants'


const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  console.log("PrivateRoute userInfo:", userInfo); // Kiểm tra giá trị userInfo
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  console.log("AuthRoute userInfo:", userInfo); // Kiểm tra giá trị userInfo
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
};

const App = () => {

  const { userInfo, setUserInfo } = useAppStore();
  const [ loading, setLoading ] = useState(true)

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO, { withCredentials: true });
        console.log("Response từ GET_USER_INFO:", response);
        if (response.status === 200 && response.data.id) {
          console.log("Set userInfo:", response.data); // Kiểm tra dữ liệu set
          setUserInfo(response.data); // Cập nhật state
        } else {
          console.log("Không tìm thấy thông tin user, đặt userInfo = undefined");
          setUserInfo(undefined);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        setUserInfo(undefined);
      } finally {
        setLoading(false); // Đảm bảo loading được tắt
      }
    };
  
    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);
  if (loading) {
    console.log("Application đang loading...");
    return <div>Loading...</div>;
  }
  

  return(
      <BrowserRouter>
        <Routes>
          <Route path="auth" element={
            <AuthRoute>
              <Auth />
            </AuthRoute>}/>
          <Route path="chat" element={
            <PrivateRoute>
                <Chat />
            </PrivateRoute>}/>
          <Route path="profile" element={
            <PrivateRoute>
                <Profile />
            </PrivateRoute>}/>
          <Route path="*" element={<Navigate to="/auth" />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App