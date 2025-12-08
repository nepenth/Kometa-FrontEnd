import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store'
import { checkAuth } from './features/auth/authSlice'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ConfigEditor from './pages/ConfigEditor'
import LibraryManager from './pages/LibraryManager';
import CollectionsManager from './pages/CollectionsManager'
import SchedulerDashboard from './pages/Scheduler'
import LogsViewer from './pages/LogsViewer'
import Login from './pages/Login'
import Loading from './components/Loading'
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './pages/NotFound'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (loading) {
    return <Loading message="Initializing..." />
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/config" element={isAuthenticated ? <Layout><ConfigEditor /></Layout> : <Navigate to="/login" />} />
        <Route path="/collections" element={isAuthenticated ? <Layout><CollectionsManager /></Layout> : <Navigate to="/login" />} />
        <Route path="/logs" element={isAuthenticated ? <Layout><LogsViewer /></Layout> : <Navigate to="/login" />} />
        <Route path="/scheduler" element={isAuthenticated ? <Layout><SchedulerDashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/about" element={isAuthenticated ? <Layout><About /></Layout> : <Navigate to="/login" />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App