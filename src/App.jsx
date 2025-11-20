import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Premium from './pages/Premium'
import Checkout from './pages/Checkout'
import Perfil from './pages/Perfil'
import TermsAndConditions from './pages/TermsAndConditions'
import UserGuide from './pages/UserGuide'
import TrialCheck from './components/TrialCheck'

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <TrialCheck>
                    <Dashboard />
                  </TrialCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <TrialCheck>
                    <Chat />
                  </TrialCheck>
                </ProtectedRoute>
              }
            />
            <Route path="/premium" element={<Premium />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/terminos" element={<TermsAndConditions />} />
            <Route path="/instrucciones" element={<UserGuide />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
