import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PageSkeleton } from './components/Skeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';

const Layout = lazy(() => import('./components/layout/Layout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const CreateProject = lazy(() => import('./pages/CreateProject'));
const EditorREST = lazy(() => import('./pages/EditorREST'));
const EditorGraphQL = lazy(() => import('./pages/EditorGraphQL'));
const EditorGRPC = lazy(() => import('./pages/EditorGRPC'));
const Viewer = lazy(() => import('./pages/Viewer'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toast />
        <ConfirmDialog />
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects/new" element={<CreateProject />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/rest/new" element={<EditorREST />} />
              <Route path="projects/:id/graphql/new" element={<EditorGraphQL />} />
              <Route path="projects/:id/grpc/new" element={<EditorGRPC />} />
              <Route path="rest/:id/edit" element={<EditorREST />} />
              <Route path="graphql/:id/edit" element={<EditorGraphQL />} />
              <Route path="grpc/:id/edit" element={<EditorGRPC />} />
            </Route>
            <Route path="/docs/:slug" element={<Viewer />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
