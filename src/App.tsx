import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PageSkeleton } from "./components/Skeleton";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toast } from "./components/Toast";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useAuthStore } from "./stores/authStore";

const Layout = lazy(() => import("./components/layout/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const EditorREST = lazy(() => import("./pages/EditorREST"));
const EditorGraphQL = lazy(() => import("./pages/EditorGraphQL"));
const EditorGRPC = lazy(() => import("./pages/EditorGRPC"));
const Viewer = lazy(() => import("./pages/Viewer"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const ABACDashboard = lazy(() => import("./pages/ABACDashboard"));
const AttributesList = lazy(() => import("./pages/AttributesList"));
const ResourcesList = lazy(() => import("./pages/ResourcesList"));
const PermissionsList = lazy(() => import("./pages/PermissionsList"));
const PoliciesList = lazy(() => import("./pages/PoliciesList"));
const UserPoliciesPage = lazy(() => import("./pages/UserPoliciesPage"));
const UserAttributesList = lazy(() => import("./pages/UserAttributesList"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (token && !user) {
      clearAuth();
    }

    if (!token && user) {
      clearAuth();
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Toast />
        <ConfirmDialog />
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="abac"
                element={
                  <ProtectedRoute>
                    <ABACDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AttributesList />} />
                <Route path="resources" element={<ResourcesList />} />
                <Route path="permissions" element={<PermissionsList />} />
                <Route path="policies" element={<PoliciesList />} />
                <Route path="user-policies" element={<UserPoliciesPage />} />
                <Route path="user-attributes" element={<UserAttributesList />} />
              </Route>
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
