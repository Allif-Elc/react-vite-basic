import { memo, useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { APITabs } from '../api/APITabs';
import { ParameterList } from '../api/ParameterList';
import { ResponseViewer } from '../api/ResponseViewer';
import { restAPISchema, type RestAPIFormData } from '../../schemas/restSchema';
import type { RestAPI } from '../../types/api';
import { formatJSON } from '../../utils/jsonFormatter';
import { useToastStore } from '../../stores/toastStore';
import { useFormDraftStore } from '../../stores/formStore';

interface RESTFormProps {
  initialData?: RestAPI | null;
  onSubmit: (data: RestAPIFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  projectId?: number;
  restId?: number;
}

export const RESTForm = memo<RESTFormProps>(({ initialData, onSubmit, isSubmitting = false, onCancel, projectId, restId }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RestAPIFormData>({
    mode: 'onBlur',
    resolver: zodResolver(restAPISchema),
    delayError: 300,
    defaultValues: {
      method: 'GET',
      headers: [],
      path_params: [],
      query_params: [],
      responses: [],
    },
  });

  const { addToast } = useToastStore();
  const [requestBodyValue, setRequestBodyValue] = useState(() => {
    if (initialData?.request_body) {
      return typeof initialData.request_body === 'string'
        ? initialData.request_body
        : JSON.stringify(initialData.request_body, null, 2);
    }
    return '';
  });

  useEffect(() => {
    if (initialData) {
      // Ensure array fields are properly formatted
      const normalizeArray = <T,>(value: T[] | Record<string, T> | null | undefined): T[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        const entries = Object.entries(value);
        if (entries.length === 0) return [];
        const allNumeric = entries.every(([key]) => /^\d+$/.test(key));
        if (allNumeric) {
          return entries
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([, val]) => val);
        }
        return Object.values(value);
      };

      // Safely extract responses - handle object or array formats
      let responsesArray: any[] = [];
      if (initialData.responses) {
        if (Array.isArray(initialData.responses)) {
          responsesArray = initialData.responses;
        } else if (typeof initialData.responses === 'object' && !Array.isArray(initialData.responses)) {
          responsesArray = Object.values(initialData.responses);
        }
      }

      // Format request_body value
      const formatRequestBody = (body: any): string => {
        if (!body) return '';
        if (typeof body === 'string') {
          try {
            const parsed = JSON.parse(body);
            return JSON.stringify(parsed, null, 2);
          } catch {
            return body;
          }
        }
        return JSON.stringify(body, null, 2);
      };

      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        method: initialData.method || 'GET',
        endpoint: initialData.endpoint || '',
        headers: normalizeArray(initialData.headers),
        path_params: normalizeArray(initialData.path_params),
        query_params: normalizeArray(initialData.query_params),
        request_body: initialData.request_body,
        responses: responsesArray,
      });
      setRequestBodyValue(formatRequestBody(initialData.request_body));
    }
  }, [initialData, reset]);

  const handleFormatJSON = useCallback(async () => {
    const result = await formatJSON(requestBodyValue);
    if (result.error) {
      addToast('Invalid JSON: ' + result.error, 'error');
    } else {
      setRequestBodyValue(result.formatted);
      setValue('request_body', result.formatted, { shouldValidate: true });
      addToast('JSON formatted successfully', 'success');
    }
  }, [requestBodyValue, setValue, addToast]);

  // Draft persistence
  const formKey = `rest-form-${projectId ?? 'new'}-${restId ?? 'new'}`;
  const { saveDraft, loadDraft, clearDraft } = useFormDraftStore();
  const draftLoadRef = useRef(false);

  // Load draft on mount (only if no initialData)
  useEffect(() => {
    if (!initialData && !draftLoadRef.current) {
      draftLoadRef.current = true;
      const draft = loadDraft(formKey);
      if (draft) {
        reset(draft);
        if (draft.request_body) {
          setRequestBodyValue(JSON.stringify(draft.request_body, null, 2));
        }
      }
    }
  }, [formKey, initialData, loadDraft, reset]);

  // Auto-save draft on change (debounced)
  const formValues = watch();
  useEffect(() => {
    if (initialData) return; // Don't save drafts in edit mode

    const timer = setTimeout(() => {
      // Only save if form has some content
      if (formValues.name || formValues.endpoint || formValues.request_body) {
        saveDraft(formKey, formValues);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formValues, formKey, saveDraft, initialData]);

  // Clear draft after successful submit
  const handleFormSubmit = useCallback(async (data: RestAPIFormData) => {
    // Zod has already transformed request_body from string to object (if needed)
    await onSubmit(data);
    if (!initialData) {
      clearDraft(formKey);
    }
  }, [onSubmit, formKey, clearDraft, initialData]);

  const tabs = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              API Name *
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Get User Profile"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this API does..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
                Method *
              </label>
              <select
                {...register('method')}
                id="method"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              {errors.method && (
                <p className="mt-1 text-sm text-red-600">{errors.method.message}</p>
              )}
            </div>
            <div className="col-span-9">
              <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint *
              </label>
              <input
                {...register('endpoint')}
                id="endpoint"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="/api/users/:id"
              />
              {errors.endpoint && (
                <p className="mt-1 text-sm text-red-600">{errors.endpoint.message}</p>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'headers',
      label: 'Headers',
      content: (
        <ParameterList
          form={{ register, control } as any}
          name="headers"
          label="Headers"
          placeholder="Header name"
          showRequired={true}
          typeOptions={['string']}
        />
      ),
    },
    {
      id: 'path',
      label: 'Path Parameters',
      content: (
        <ParameterList
          form={{ register, control } as any}
          name="path_params"
          label="Path Parameters"
          placeholder=":id"
        />
      ),
    },
    {
      id: 'query',
      label: 'Query Parameters',
      content: (
        <ParameterList
          form={{ register, control } as any}
          name="query_params"
          label="Query Parameters"
          placeholder="param"
        />
      ),
    },
    {
      id: 'body',
      label: 'Request Body',
      content: (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Request Body Schema (JSON)
            </label>
            <button
              type="button"
              onClick={handleFormatJSON}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Format JSON
            </button>
          </div>
          <textarea
            name="request_body"
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-gray-50"
            placeholder='{"type": "object", "properties": {}}'
            value={requestBodyValue}
            onChange={(e) => {
              const value = e.target.value;
              setRequestBodyValue(value);
              // Update react-hook-form's internal state
              setValue('request_body', value, { shouldValidate: true });
            }}
          />
          <p className="mt-1 text-sm text-gray-500">Enter a valid JSON schema for the request body.</p>
        </div>
      ),
    },
    {
      id: 'responses',
      label: 'Responses',
      content: <ResponseViewer form={{ register, control } as any} name="responses" />,
    },
  ], [register, control, errors, initialData, handleFormatJSON, requestBodyValue]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <APITabs tabs={tabs} defaultTab="overview" />

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save API'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
});

RESTForm.displayName = 'RESTForm';
