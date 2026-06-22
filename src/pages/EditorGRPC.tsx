import { useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAPIStore } from "../stores/apiStore";
import { useToastStore } from "../stores/toastStore";
import { GRPCForm } from "../components/editor/GRPCForm";

export default function EditorGRPC() {
  const { id, grpcId } = useParams<{ id?: string; grpcId?: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const isEditing = Boolean(grpcId);
  const projectId = id ? Number(id) : 0;

  const {
    currentGrpcAPI,
    loading,
    error,
    fetchGrpcAPI,
    createGrpcAPI,
    updateGrpcAPI,
    clearCurrentAPI,
    clearError,
  } = useAPIStore();

  useEffect(() => {
    if (isEditing && grpcId) {
      fetchGrpcAPI(Number(grpcId));
    }
    return () => {
      clearCurrentAPI();
    };
  }, [isEditing, grpcId, fetchGrpcAPI, clearCurrentAPI]);

  useEffect(() => {
    if (error) {
      addToast(error, "error");
      clearError();
    }
  }, [error, addToast, clearError]);

  const handleSubmit = useCallback(
    async (data: any) => {
      try {
        if (isEditing && grpcId) {
          await updateGrpcAPI(Number(grpcId), data);
          addToast("API updated successfully", "success");
        } else {
          await createGrpcAPI(projectId, data);
          addToast("API created successfully", "success");
          navigate(`/projects/${projectId}`);
        }
      } catch (err) {
        addToast("Failed to save API", "error");
      }
    },
    [isEditing, grpcId, projectId, updateGrpcAPI, createGrpcAPI, navigate, addToast]
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const title = useMemo(() => (isEditing ? "Edit gRPC API" : "Create gRPC API"), [isEditing]);

  if (loading && isEditing) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-52 mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <button
          onClick={handleCancel}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>

      <GRPCForm
        initialData={currentGrpcAPI}
        onSubmit={handleSubmit}
        isSubmitting={loading}
        onCancel={handleCancel}
      />
    </div>
  );
}
