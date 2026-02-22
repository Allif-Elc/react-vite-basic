import { memo, useCallback } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ParameterListProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  typeOptions?: string[];
  placeholder?: string;
  showRequired?: boolean;
}

const TYPE_OPTIONS = ['string', 'integer', 'boolean', 'number'];

export const ParameterList = memo<ParameterListProps>(({
  form,
  name,
  label,
  typeOptions = TYPE_OPTIONS,
  placeholder = 'Parameter name',
  showRequired = true,
}) => {
  const { register, control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const handleAdd = useCallback(() => {
    append({ name: '', type: 'string', required: false, description: '' });
  }, [append]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
        >
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {fields.length === 0 ? (
          <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded">
            No {label.toLowerCase()} added yet
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start p-3 border border-gray-200 rounded-lg bg-white">
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-6 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove parameter"
              >
                <X size={16} />
              </button>
              <div className="flex-1 grid grid-cols-12 gap-2">
                <div className="col-span-3">
                  <input
                    {...register(`${name}.${index}.name`)}
                    type="text"
                    placeholder={placeholder}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <select
                    {...register(`${name}.${index}.type`)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {showRequired && (
                  <div className="col-span-2 flex items-center">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        {...register(`${name}.${index}.required`)}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Required
                    </label>
                  </div>
                )}
                <div className={clsx('col-span-5', showRequired ? 'col-span-5' : 'col-span-7')}>
                  <input
                    {...register(`${name}.${index}.description`)}
                    type="text"
                    placeholder="Description"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

ParameterList.displayName = 'ParameterList';
