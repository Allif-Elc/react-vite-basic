import { useEffect, useCallback, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAPIStore } from "../stores/apiStore";
import { useToastStore } from "../stores/toastStore";
import { RESTForm } from "../components/editor/RESTForm";
import { logger } from "../utils/logger";

export default function EditorREST() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = location.pathname.endsWith("/edit");
  const projectId = !isEditing && id ? Number(id) : 0;
  const apiId = isEditing && id ? Number(id) : undefined;

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
    if (isEditing && apiId) {
      fetchRestAPI(apiId);
    }
    return () => {
      clearCurrentAPI();
    };
  }, [isEditing, apiId, fetchRestAPI, clearCurrentAPI]);

  useEffect(() => {
    if (error) {
      addToast(error, "error");
      clearError();
    }
  }, [error, addToast, clearError]);

  const handleSubmit = useCallback(
    async (data: any) => {
      logger.debug("[EditorREST] handleSubmit called", { isEditing, apiId });
      setIsSubmitting(true);
      try {
        if (isEditing && apiId) {
          await updateRestAPI(apiId, data);
          addToast("API updated successfully", "success");
        } else {
          await createRestAPI(projectId, data);
          addToast("API created successfully", "success");
          navigate(`/projects/${projectId}`);
        }
      } catch (err) {
        logger.error("[EditorREST] handleSubmit error", err);
        addToast("Failed to save API", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditing, apiId, projectId, updateRestAPI, createRestAPI, navigate, addToast]
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const title = useMemo(() => (isEditing ? "Edit REST API" : "Create REST API"), [isEditing]);

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
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
        projectId={projectId}
        restId={apiId}
      />
    </div>
  );
}
