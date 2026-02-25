import { memo, useCallback, useEffect, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";

interface ResponseViewerProps {
  form: UseFormReturn<any>;
  name: string;
}

const bodyToString = (body: unknown): string => {
  if (body === undefined || body === null) return "{}";
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return "{}";
  }
};

const stringToBody = (value: string): unknown => {
  if (!value || value.trim() === "{}") return {};
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

interface ResponseItemProps {
  /** Used only for React key stability */
  field: { id: string };
  index: number;
  name: string;
  form: UseFormReturn<any>;
  onRemove: (index: number) => void;
  expanded: boolean;
  onToggle: () => void;
}

const ResponseItem = memo<ResponseItemProps>(
  ({ field: _field, index, name, form, onRemove, expanded, onToggle }) => {
    const { register, setValue } = form;
    const [localBodyValue, setLocalBodyValue] = useState("{}");

    // Initialize local state from form
    useEffect(() => {
      const responses = (form.control as any)._formValues?.[name];
      if (responses?.[index]?.body !== undefined) {
        setLocalBodyValue(bodyToString(responses[index].body));
      }
    }, [index, name, form.control]);

    const handleBodyChange = useCallback(
      (value: string) => {
        setLocalBodyValue(value);
        setValue(`${name}.${index}.body`, stringToBody(value), { shouldValidate: true });
      },
      [name, index, setValue]
    );

    return (
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div
          className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={onToggle}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <div className="flex-1 grid grid-cols-12 gap-2">
            <div className="col-span-2">
              <input
                {...register(`${name}.${index}.status_code`, { valueAsNumber: true })}
                type="number"
                min="100"
                max="599"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="200"
              />
            </div>
            <div className="col-span-8">
              <input
                {...register(`${name}.${index}.description`)}
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Success response"
              />
            </div>
            <div className="col-span-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="w-full px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        {expanded && (
          <div className="p-3 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Body (JSON)
            </label>
            <textarea
              rows={10}
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder='{"message": "Success"}'
              value={localBodyValue}
              onChange={(e) => handleBodyChange(e.target.value)}
            />
          </div>
        )}
      </div>
    );
  }
);

ResponseItem.displayName = "ResponseItem";

export const ResponseViewer = memo<ResponseViewerProps>(({ form, name }) => {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const [expandedStates, setExpandedStates] = useState<Record<number, boolean>>({});

  const handleAdd = useCallback(() => {
    const newIndex = fields.length;
    append({ status_code: 200, description: "", body: {} });
    setExpandedStates((prev) => ({ ...prev, [newIndex]: true }));
  }, [append, fields.length]);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedStates((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Response Examples</label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
        >
          <Plus size={16} /> Add Response
        </button>
      </div>
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded">
            No response examples added yet
          </div>
        ) : (
          fields.map((field, index) => (
            <ResponseItem
              key={field.id}
              field={field}
              index={index}
              name={name}
              form={form}
              onRemove={remove}
              expanded={expandedStates[index] || false}
              onToggle={() => toggleExpanded(index)}
            />
          ))
        )}
      </div>
    </div>
  );
});

ResponseViewer.displayName = "ResponseViewer";
