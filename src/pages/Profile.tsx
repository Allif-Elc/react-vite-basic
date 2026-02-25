import { memo, useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useProfileStore,
  selectProfile,
  selectProfileLoading,
  selectProfileError,
} from "../stores/profileStore";
import { useAuthStore, selectUser } from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";
import { profileSchema, type ProfileFormData } from "../schemas/profileSchema";
import { PageSkeleton } from "../components/Skeleton";
import {
  User,
  Mail,
  Calendar,
  Globe,
  Phone,
  FileText,
  Edit2,
  Save,
  X,
  UserCircle,
} from "lucide-react";
import type { Profile } from "../types/profile";

const ProfileView = memo(({ profile, onEdit }: { profile: Profile; onEdit: () => void }) => {
  const user = useAuthStore(selectUser);
  const fields = useMemo(
    () => [
      { icon: User, label: "Name", value: profile?.user?.name || "Not set" },
      { icon: Mail, label: "Email", value: user?.email || "Not set" },
      { icon: Calendar, label: "Age", value: profile.age?.toString() || "Not set" },
      {
        icon: User,
        label: "Gender",
        value: profile.gender
          ? profile.gender.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "Not set",
      },
      { icon: FileText, label: "Bio", value: profile.bio || "Not set" },
      { icon: Phone, label: "Phone", value: profile.phonenumber || "Not set" },
      { icon: Globe, label: "Website", value: profile.website || "Not set" },
    ],
    [user, profile]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || "User Profile"}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.label} className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{field.label}</p>
                <p className="text-gray-900 break-words">{field.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProfileView.displayName = "ProfileView";

const ProfileEdit = memo(
  ({
    profile,
    onCancel,
    onSave,
  }: {
    profile: Profile | null;
    onCancel: () => void;
    onSave: (data: ProfileFormData) => Promise<void>;
  }) => {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
      mode: "onBlur",
      resolver: zodResolver(profileSchema),
      delayError: 300,
      defaultValues: {
        age: profile?.age,
        gender: profile?.gender,
        bio: profile?.bio,
        phonenumber: profile?.phonenumber,
        website: profile?.website,
      },
    });

    const genderOptions = [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ] as const;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                {...register("age", { valueAsNumber: true })}
                id="age"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25"
              />
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register("gender")}
                id="gender"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              {...register("bio")}
              id="bio"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                {...register("phonenumber")}
                id="phonenumber"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
              {errors.phonenumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phonenumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                {...register("website")}
                id="website"
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }
);

ProfileEdit.displayName = "ProfileEdit";

export default function Profile() {
  const profile = useProfileStore(selectProfile);
  const loading = useProfileStore(selectProfileLoading);
  const error = useProfileStore(selectProfileError);
  const { fetchProfile, updateProfile, createProfile, clearError } = useProfileStore();
  const { addToast } = useToastStore();
  const user = useAuthStore(selectUser);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.id_user) {
      fetchProfile();
    }
  }, [fetchProfile, user?.id_user, user?.email]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    clearError();
  }, [clearError]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    clearError();
  }, [clearError]);

  const handleSave = useCallback(
    async (data: ProfileFormData) => {
      try {
        // Filter out empty strings to convert them to undefined
        const cleanedData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== "")
        ) as ProfileFormData;

        if (profile) {
          await updateProfile(profile.id_profile, cleanedData);
          addToast("Profile updated successfully", "success");
        } else {
          await createProfile(cleanedData);
          addToast("Profile created successfully", "success");
        }
        setIsEditing(false);
      } catch {
        addToast("Failed to save profile", "error");
      }
    },
    [profile, updateProfile, createProfile, addToast]
  );

  if (loading && !profile) {
    return <PageSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {isEditing ? (
        <ProfileEdit profile={profile} onCancel={handleCancel} onSave={handleSave} />
      ) : (
        <>
          {profile ? (
            <ProfileView profile={profile} onEdit={handleEdit} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Profile Found</h2>
              <p className="text-gray-500 mb-6">Create your profile to get started</p>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Profile
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
