import { useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAPIStore } from '../stores/apiStore';
import { useToastStore } from '../stores/toastStore';
import { RESTForm } from '../components/editor/RESTForm';

export default function EditorREST() {
  const { id, restId } = useParams<{ id?: string; restId?: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const isEditing = Boolean(restId);
  const projectId = id ? Number(id) : 0;

  const {
    currentRestAPI,
    loading,
    error,
    fetchRestAPI,
    createRestAPI,
    updateRestAPI,
    clearCurrentAPI,
    clearError,
  } = useAPIStore();

  useEffect(() => {
    if (isEditing && restId) {
      fetchRestAPI(Number(restId));
    }
    return () => {
      clearCurrentAPI();
    };
  }, [isEditing, restId, fetchRestAPI, clearCurrentAPI]);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
      clearError();
    }
  }, [error, addToast, clearError]);

  const handleSubmit = useCallback(async (data: any) => {
    try {
      if (isEditing && restId) {
        await updateRestAPI(Number(restId), data);
        addToast('API updated successfully', 'success');
      } else {
        await createRestAPI(projectId, data);
        addToast('API created successfully', 'success');
        navigate(`/projects/${projectId}`);
      }
    } catch (err) {
      addToast('Failed to save API', 'error');
    }
  }, [isEditing, restId, projectId, updateRestAPI, createRestAPI, navigate, addToast]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const title = useMemo(() => (isEditing ? 'Edit REST API' : 'Create REST API'), [isEditing]);

  if (loading && isEditing) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
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

      <RESTForm
        initialData={currentRestAPI}
        onSubmit={handleSubmit}
        isSubmitting={loading}
        onCancel={handleCancel}
        projectId={projectId}
        restId={restId ? Number(restId) : undefined}
      />
    </div>
  );
}
