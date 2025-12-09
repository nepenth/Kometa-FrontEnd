import React, { Suspense, useEffect } from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Loading from './components/Loading';
import { checkAuth } from './features/auth/authSlice';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { useAppDispatch, useAppSelector } from './store';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ConfigEditor = React.lazy(() => import('./pages/ConfigEditor'));
const LibraryManager = React.lazy(() => import('./pages/LibraryManager'));
const CollectionsManager = React.lazy(() => import('./pages/CollectionsManager'));
const SchedulerDashboard = React.lazy(() => import('./pages/Scheduler'));
const LogsViewer = React.lazy(() => import('./pages/LogsViewer'));
const About = React.lazy(() => import('./pages/About'));

const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <Loading message="Initializing..." />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading message="Loading..." />}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/config"
            element={
              isAuthenticated ? (
                <Layout>
                  <ConfigEditor />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/libraries"
            element={
              isAuthenticated ? (
                <Layout>
                  <LibraryManager />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/collections"
            element={
              isAuthenticated ? (
                <Layout>
                  <CollectionsManager />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/logs"
            element={
              isAuthenticated ? (
                <Layout>
                  <LogsViewer />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/scheduler"
            element={
              isAuthenticated ? (
                <Layout>
                  <SchedulerDashboard />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/about"
            element={
              isAuthenticated ? (
                <Layout>
                  <About />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
