import { memo } from "react";
import { Edit2, Trash2, Clock, UserCog } from "lucide-react";
import type { UserPolicyDetail } from "../../types/abac";

interface UserPolicyItemProps {
  userPolicy: UserPolicyDetail;
  onEdit: (policy: UserPolicyDetail) => void;
  onDelete: (id: number) => void;
}

export const UserPolicyItem = memo<UserPolicyItemProps>(({ userPolicy, onEdit, onDelete }) => {
  const getPriorityColor = (priority: number) => {
    if (priority > 50) return "text-green-700 bg-green-100";
    if (priority > 0) return "text-green-600 bg-green-50";
    if (priority < -50) return "text-red-700 bg-red-100";
    if (priority < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-100";
  };

  const formatExpiration = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return "Expired";
    if (daysUntilExpiry === 0) return "Expires today";
    if (daysUntilExpiry === 1) return "Expires tomorrow";
    if (daysUntilExpiry < 7) return `Expires in ${daysUntilExpiry} days`;
    if (daysUntilExpiry < 30) return `Expires in ${Math.ceil(daysUntilExpiry / 7)} weeks`;

    return date.toLocaleDateString();
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border ${userPolicy.is_active ? "border-gray-200" : "border-gray-300 opacity-75"} p-5 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserCog className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{userPolicy.user_name}</h3>
            <p className="text-sm text-gray-500">{userPolicy.user_email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(userPolicy)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit user policy"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(userPolicy.id_user_policy)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete user policy"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Policy:</span>
          <span className="text-sm font-medium text-gray-900">{userPolicy.policy_name}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Priority:</span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(userPolicy.priority)}`}
          >
            {userPolicy.priority > 0 ? "+" : ""}
            {userPolicy.priority}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              userPolicy.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            {userPolicy.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {userPolicy.expires_at && (
          <div
            className={`flex items-center gap-1 text-xs ${
              new Date(userPolicy.expires_at) < new Date() ? "text-red-600" : "text-amber-600"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{formatExpiration(userPolicy.expires_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
});

UserPolicyItem.displayName = "UserPolicyItem";
