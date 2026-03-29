"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { User, Mail, Phone, Lock, LogOut } from "lucide-react";
import { ProfilePictureUpload } from "~/components/user/profile-picture-upload";

const COUNTRY_CODES = [
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt?: Date;
}

export default function UserProfile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameData, setEditNameData] = useState({
    firstName: "",
    lastName: "",
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmailData, setEditEmailData] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhoneData, setEditPhoneData] = useState({
    countryCode: "+63",
    phoneNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const data = (await response.json()) as {
            authenticated: boolean;
            user?: {
              id: string;
              email: string;
              firstName?: string;
              lastName?: string;
              phoneNumber?: string;
              profileImage?: string;
              createdAt?: string;
            };
          };
          if (data.authenticated && data.user) {
            setUserProfile({
              id: data.user.id,
              name:
                `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() ||
                "User",
              email: data.user.email,
              phoneNumber: data.user.phoneNumber,
              profileImage:
                data.user.profileImage || "/profile/default_profile.jpg",
              createdAt: data.user.createdAt
                ? new Date(data.user.createdAt)
                : undefined,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleSaveName = async () => {
    try {
      setError("");
      setSuccess("");
      setSaving(true);
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editNameData.firstName,
          lastName: editNameData.lastName,
        }),
      });

      if (response.ok) {
        const newName =
          `${editNameData.firstName} ${editNameData.lastName}`.trim();
        setUserProfile((prev) => (prev ? { ...prev, name: newName } : null));
        setIsEditingName(false);
        setSuccess("Name updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update name");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update name";
      console.error("Failed to update name:", err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      setError("");
      setSuccess("");
      setSaving(true);
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editEmailData }),
      });

      if (response.ok) {
        setUserProfile((prev) =>
          prev ? { ...prev, email: editEmailData } : null,
        );
        setIsEditingEmail(false);
        setSuccess("Email updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update email");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update email";
      console.error("Failed to update email:", err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhone = async () => {
    try {
      setError("");
      setSuccess("");
      setSaving(true);
      const phoneNumber =
        editPhoneData.countryCode +
        editPhoneData.phoneNumber.replace(/\D/g, "");
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        setUserProfile((prev) => (prev ? { ...prev, phoneNumber } : null));
        setIsEditingPhone(false);
        setSuccess("Phone number updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update phone number");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update phone number";
      console.error("Failed to update phone number:", err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (imageUrl: string) => {
    try {
      setError("");
      setSuccess("");
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: imageUrl }),
      });

      if (response.ok) {
        setUserProfile((prev) =>
          prev ? { ...prev, profileImage: imageUrl } : null,
        );
        setSuccess("Profile picture updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile picture");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update profile picture";
      console.error("Failed to update profile picture:", err);
      setError(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071d3a] p-8">
        <p className="text-white">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Profile Settings</h1>
          <p className="mt-2 text-gray-400">Manage your account information</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            {success}
          </div>
        )}

        {/* Personal Information */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8 lg:col-span-2">
            <div className="flex flex-col items-center gap-8">
              {/* Profile Picture Section */}
              <div className="flex w-full flex-col items-center gap-4 border-b border-[#f1c44f]/20 pb-8">
                <h2 className="text-2xl font-bold text-white">
                  Profile Picture
                </h2>
                <ProfilePictureUpload
                  currentImage={userProfile?.profileImage}
                  firstName={userProfile?.name}
                  onUploadComplete={handleProfilePictureUpload}
                />
              </div>

              {/* Personal Information */}
              <div className="w-full">
                <h2 className="mb-6 text-2xl font-bold text-white">
                  Personal Information
                </h2>

                {/* Name */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <User size={16} />
                      Full Name
                    </label>
                    {!isEditingName && (
                      <button
                        onClick={() => {
                          const [first, last] = (userProfile?.name ?? "").split(
                            " ",
                          );
                          setEditNameData({
                            firstName: first || "",
                            lastName: last || "",
                          });
                          setIsEditingName(true);
                        }}
                        className="text-sm font-medium text-[#f1c44f] hover:text-[#f1c44f]/80"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {!isEditingName ? (
                    <>
                      <input
                        type="text"
                        value={userProfile?.name ?? ""}
                        disabled
                        className="w-full cursor-not-allowed rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Your full name
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={editNameData.firstName}
                          onChange={(e) =>
                            setEditNameData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          className="flex-1 rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={editNameData.lastName}
                          onChange={(e) =>
                            setEditNameData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          className="flex-1 rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f] focus:outline-none"
                        />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleSaveName}
                          disabled={saving}
                          className="flex-1 rounded border border-[#f1c44f]/20 bg-[#f1c44f] px-4 py-2 font-medium text-[#071d3a] hover:bg-[#f1c44f]/90 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setIsEditingName(false)}
                          disabled={saving}
                          className="flex-1 rounded border border-gray-600 px-4 py-2 text-gray-300 hover:border-gray-400 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Email */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail size={16} />
                      Email Address
                    </label>
                    {!isEditingEmail && (
                      <button
                        onClick={() => {
                          setEditEmailData(userProfile?.email ?? "");
                          setIsEditingEmail(true);
                        }}
                        className="text-sm font-medium text-[#f1c44f] hover:text-[#f1c44f]/80"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {!isEditingEmail ? (
                    <>
                      <input
                        type="email"
                        value={userProfile?.email ?? ""}
                        disabled
                        className="w-full cursor-not-allowed rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Primary email address
                      </p>
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={editEmailData}
                        onChange={(e) => setEditEmailData(e.target.value)}
                        className="w-full rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f] focus:outline-none"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleSaveEmail}
                          disabled={saving}
                          className="flex-1 rounded border border-[#f1c44f]/20 bg-[#f1c44f] px-4 py-2 font-medium text-[#071d3a] hover:bg-[#f1c44f]/90 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setIsEditingEmail(false)}
                          disabled={saving}
                          className="flex-1 rounded border border-gray-600 px-4 py-2 text-gray-300 hover:border-gray-400 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone size={16} />
                      Phone Number
                    </label>
                    {!isEditingPhone && (
                      <button
                        onClick={() => {
                          setIsEditingPhone(true);
                          // Parse existing phone number if present
                          if (
                            userProfile?.phoneNumber &&
                            userProfile.phoneNumber !== "Not set"
                          ) {
                            const phoneStr = userProfile.phoneNumber;
                            // Find matching country code
                            let foundCode = "+63"; // default
                            for (const country of COUNTRY_CODES) {
                              if (phoneStr.startsWith(country.code)) {
                                foundCode = country.code;
                                break;
                              }
                            }
                            setEditPhoneData({
                              countryCode: foundCode,
                              phoneNumber: phoneStr.replace(foundCode, ""),
                            });
                          } else {
                            setEditPhoneData({
                              countryCode: "+63",
                              phoneNumber: "",
                            });
                          }
                        }}
                        className="text-sm font-medium text-[#f1c44f] hover:text-[#f1c44f]/80"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {!isEditingPhone ? (
                    <>
                      <input
                        type="tel"
                        value={userProfile?.phoneNumber ?? "Not set"}
                        disabled
                        className="w-full cursor-not-allowed rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Contact number for bookings
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <select
                          value={editPhoneData.countryCode}
                          onChange={(e) =>
                            setEditPhoneData((prev) => ({
                              ...prev,
                              countryCode: e.target.value,
                            }))
                          }
                          className="w-32 rounded border border-[#f1c44f]/20 bg-[#071d3a] px-3 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
                        >
                          {COUNTRY_CODES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          placeholder="e.g., 917234567"
                          value={editPhoneData.phoneNumber}
                          onChange={(e) =>
                            setEditPhoneData((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value,
                            }))
                          }
                          className="flex-1 rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f] focus:outline-none"
                        />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleSavePhone}
                          disabled={saving}
                          className="flex-1 rounded border border-[#f1c44f]/20 bg-[#f1c44f] px-4 py-2 font-medium text-[#071d3a] hover:bg-[#f1c44f]/90 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setIsEditingPhone(false)}
                          disabled={saving}
                          className="flex-1 rounded border border-gray-600 px-4 py-2 text-gray-300 hover:border-gray-400 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Status */}
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8">
          <h3 className="mb-4 text-lg font-bold text-white">Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Account Type</span>
              <Badge className="bg-blue-500/20 text-blue-400">Passenger</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Account Status</span>
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Member Since</span>
              <span className="text-white">
                {userProfile?.createdAt
                  ? userProfile.createdAt.toLocaleDateString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
