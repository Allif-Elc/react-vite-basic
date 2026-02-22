import { useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAPIStore } from '../stores/apiStore';
import { useToastStore } from '../stores/toastStore';
import { GraphQLForm } from '../components/editor/GraphQLForm';

export default function EditorGraphQL() {
  const { id, graphqlId } = useParams<{ id?: string; graphqlId?: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const isEditing = Boolean(graphqlId);
  const projectId = id ? Number(id) : 0;

  const {
    currentGraphQLAPI,
    loading,
    error,
    fetchGraphQLAPI,
    createGraphQLAPI,
    updateGraphQLAPI,
    clearCurrentAPI,
    clearError,
  } = useAPIStore();

  useEffect(() => {
    if (isEditing && graphqlId) {
      fetchGraphQLAPI(Number(graphqlId));
    }
    return () => {
      clearCurrentAPI();
    };
  }, [isEditing, graphqlId, fetchGraphQLAPI, clearCurrentAPI]);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
      clearError();
    }
  }, [error, addToast, clearError]);

  const handleSubmit = useCallback(async (data: any) => {
    try {
      if (isEditing && graphqlId) {
        await updateGraphQLAPI(Number(graphqlId), data);
        addToast('API updated successfully', 'success');
      } else {
        await createGraphQLAPI(projectId, data);
        addToast('API created successfully', 'success');
        navigate(`/projects/${projectId}`);
      }
    } catch (err) {
      addToast('Failed to save API', 'error');
    }
  }, [isEditing, graphqlId, projectId, updateGraphQLAPI, createGraphQLAPI, navigate, addToast]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const title = useMemo(() => (isEditing ? 'Edit GraphQL API' : 'Create GraphQL API'), [isEditing]);

  if (loading && isEditing) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-56 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      <GraphQLForm
        initialData={currentGraphQLAPI}
        onSubmit={handleSubmit}
        isSubmitting={loading}
        onCancel={handleCancel}
      />
    </div>
  );
}
