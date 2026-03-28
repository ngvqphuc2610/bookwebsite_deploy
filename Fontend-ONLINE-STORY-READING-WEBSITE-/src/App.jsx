import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SiteHeader } from './components/site-header';
import { SiteFooter } from './components/site-footer';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';

import ChatBox from './components/ChatBox';
import SupportChat from './components/SupportChat';
import AdminSupportPanel from './pages/AdminSupportPanel';

import AdminGenreManagement from './pages/AdminGenreManagement';
import StoryDetail from './pages/StoryDetail';
import CategoryPage from './pages/CategoryPage';
import StaffChapterManagement from './pages/StaffChapterManagement';
import Profile from './pages/Profile';
import ReadStory from './pages/ReadStory';
import PremiumPricing from './pages/PremiumPricing';
import AdminPremiumManagement from './pages/AdminPremiumManagement';
import OAuth2Redirect from './pages/OAuth2Redirect';
import Checkout from './pages/Checkout';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminLogs from './pages/AdminLogs';
import AdminSettings from './pages/AdminSettings';
import Favorites from './pages/Favorites';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/Navbar';

import './App.css';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>

      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminUserManagement />} />
          <Route path="/staff" element={<AdminDashboard />} />
          <Route path="/staff/import" element={<StaffDashboard />} />
          <Route path="/login" element={<Login />} />
          {/* Add more routes as you build them */}
          <Route path="/genres" element={<div className="container" style={{ paddingTop: '100px' }}><h2>Trang Thể Loại đang phát triển...</h2></div>} />
          <Route path="/premium" element={<div className="container" style={{ paddingTop: '100px' }}><h2>Trang Premium đang phát triển...</h2></div>} />
          <Route path="/support" element={<SupportChat />} />
          <Route path="/admin/support" element={<AdminSupportPanel />} />
        </Routes>
      </div>

      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUserManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/story/:id" element={<StoryDetail />} />
            <Route path="/story/:storyId/read/:chapterId" element={<ReadStory />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/search" element={<CategoryPage />} />
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff/import"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/genres"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminGenreManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/story/:storyId/chapters"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <StaffChapterManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'USER']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
            {/* Add more routes as you build them */}
            <Route path="/genres" element={<div className="container mx-auto px-4 py-20"><h2>Trang Thể Loại đang phát triển...</h2></div>} />
            <Route path="/premium" element={<PremiumPricing />} />
            <Route
              path="/checkout/:packageId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'USER']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/premium"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminPremiumManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'USER']}>
                  <Favorites />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <SiteFooter />


        {/* Floating Chatbot — hidden when AI is disabled */}
        {import.meta.env.VITE_ENABLE_AI_CHAT !== 'false' && <ChatBox />}
      </div>
    </Router>

  );
}



export default App;
