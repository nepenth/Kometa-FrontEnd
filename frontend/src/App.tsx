import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store'
import { checkAuth } from './features/auth/authSlice'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ConfigEditor from './pages/ConfigEditor'
import CollectionsManager from './pages/CollectionsManager'
import LogsViewer from './pages/LogsViewer'
import Login from './pages/Login'
import Loading from './components/Loading'

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (loading) {
    return <Loading />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/config" element={<ConfigEditor />} />
            <Route path="/collections" element={<CollectionsManager />} />
            <Route path="/logs" element={<LogsViewer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Layout>
  )
}

export default App