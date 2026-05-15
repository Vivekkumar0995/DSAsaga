"use client";

import { FiCamera } from "react-icons/fi";
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import countriesData from "world-countries";

type FormData = Record<string, string>; 

type Field = {
  label: string;
  name: keyof FormData;
  disabled?: boolean;
  readOnly?: boolean;
};

type CountryOption = {
  code: string;
  name: string;
  flag: string;
};

type WorldCountry = {
  name?: { common?: string };
  cca2?: string;
  flag?: string;
};

const countryCodeToFlagEmoji = (code?: string) => {
  if (!code || !/^[A-Z]{2}$/.test(code)) return "🏳️";

  const first = code.charCodeAt(0) - 65 + 0x1f1e6;
  const second = code.charCodeAt(1) - 65 + 0x1f1e6;

  return String.fromCodePoint(first, second);
};

/* 🌍 FULL COUNTRY LIST WITH FLAGS */
const countries: CountryOption[] = (countriesData as WorldCountry[])
  .map((country) => ({
    code: country.cca2 ?? "",
    name: country.name?.common ?? "",
    flag: /^[A-Z]{2}$/.test(country.flag ?? "")
      ? countryCodeToFlagEmoji(country.flag)
      : country.flag || countryCodeToFlagEmoji(country.cca2),
  }))
  .filter((country) => country.code && country.name)
  .sort((a, b) => a.name.localeCompare(b.name));

const personalFields: Field[] = [
  { label: "Full Name", name: "name" },
  { label: "Date of Birth", name: "dateOfBirth" },
  { label: "Phone Number", name: "phoneNumber" },
  { label: "Gender", name: "gender" },
  { label: "Nationality", name: "nationality" },
  { label: "Address", name: "address" },
];

const accountFields: Field[] = [
  { label: "Display Name", name: "displayName" },
  { label: "Email", name: "email", disabled: true, readOnly: true },
  { label: "Account Created", name: "accountCreated", disabled: true, readOnly: true },
  { label: "Last Login", name: "lastLogin", disabled: true, readOnly: true },
  { label: "Dark Mode", name: "darkMode" },
];

const ProfileDetailsPage = () => {
  const router = useRouter();
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  /* ✅ default dark mode OFF */
  const [formData, setFormData] = useState<FormData>({
    darkMode: "false",
  });

  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const loadProfile = async () => { 
      try {
        const res = await axios.get("/api/profile");
        if (res.data?.data) {
          const user = res.data.data;
          setFormData({
            ...user,
            darkMode: String(user.darkMode ?? "false"),
            accountCreated: user.createdAt
              ? new Date(user.createdAt).toLocaleString()
              : "",
            lastLogin: user.lastLoginAt || user.createdAt
              ? new Date(user.lastLoginAt || user.createdAt).toLocaleString()
              : "",
          });
        }
      } catch {}
    };

    loadProfile();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "email") return;

    // Phone number validation: only accept numbers (silently, no toasts)
    if (name === "phoneNumber") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    // Validate phone number before updating
    if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Updating profile...");

    try {
      const {
        email,
        accountCreated,
        lastLogin,
        createdAt,
        updatedAt,
        lastLoginAt,
        ...updatableData
      } = formData;
      await axios.put("/api/profile", updatableData);

      toast.success("Profile updated successfully!", { id: loadingToast });
      router.push("/profile");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update profile.";

      toast.error(message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleCameraClick = () => {
    profileImageInputRef.current?.click();
  };

  const handleProfileImageChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      input.value = "";
      return;
    }

    const loadingToast = toast.loading("Uploading profile image...");
    setIsUploadingImage(true);

    try {
      const uploadPayload = new FormData();
      uploadPayload.append("file", file);

      const uploadResponse = await axios.post("/api/image-upload", uploadPayload);
      const profileImageUrl = uploadResponse.data?.url;

      if (!profileImageUrl) {
        throw new Error("Image URL not returned from upload API");
      }

      await axios.put("/api/profile", { profileImage: profileImageUrl });

      setFormData((prev) => ({
        ...prev,
        profileImage: profileImageUrl,
      }));

      toast.success("Profile image updated!", { id: loadingToast });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update profile image.";
      toast.error(message, { id: loadingToast });
    } finally {
      setIsUploadingImage(false);
      input.value = ""; 
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          name={formData.name}
          email={formData.email}
          profileImage={formData.profileImage}
          onCameraClick={handleCameraClick}
          isUploadingImage={isUploadingImage}
        />
        <input
          ref={profileImageInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfileImageChange}
          className="hidden"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormCard
            title="Personal Details"
            fields={personalFields}
            data={formData}
            onChange={handleChange}
          />
          <FormCard
            title="Account Details"
            fields={accountFields}
            data={formData}
            onChange={handleChange}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            } text-white px-6 py-2.5 rounded-lg transition`}
          >
            {loading ? "Saving..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailsPage;

/* 🔥 HEADER */
const ProfileHeader = ({
  name,
  email,
  profileImage,
  onCameraClick,
  isUploadingImage,
}: {
  name?: string;
  email?: string;
  profileImage?: string;
  onCameraClick: () => void;
  isUploadingImage: boolean;
}) => (
  <div className="text-center mb-10">
    <div className="relative inline-block">
      <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg">
        <img
          src={profileImage || "/images/white.jpg"}
          alt="."
          className="h-full w-full object-cover"
        />
      </div>

      <button
        type="button"
        onClick={onCameraClick}
        disabled={isUploadingImage}
        className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full shadow cursor-pointer disabled:opacity-60"
      >
        <FiCamera size={14} />
      </button>
    </div>

    <h2 className="text-xl font-semibold mt-4">
      {name || "Your Name"}
    </h2>
    <p className="text-gray-500 text-sm">
      {email || "email@example.com"}
    </p>
  </div>
);

/* 🔥 FORM CARD */
const FormCard = ({
  title,
  fields,
  data,
  onChange,
}: {
  title: string;
  fields: Field[];
  data: FormData;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}) => (
  <div className="bg-white/20 backdrop-blur-xs p-6 rounded-2xl border border-gray-300/60 shadow">
    <h3 className="font-semibold text-gray-700 mb-4">{title}</h3>

    <div className="space-y-3">
      {fields.map((field) => (
        <InputItem
          key={field.name}
          label={field.label}
          name={field.name}
          value={data[field.name] || ""}
          onChange={onChange}
          disabled={field.disabled}
          readOnly={field.readOnly}
        />
      ))}
    </div>
  </div>
);

/* 🔥 INPUT ITEM */
const InputItem = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  disabled?: boolean;
  readOnly?: boolean;
}) => {
  const isDateField = name === "dateOfBirth";
  const isGenderField = name === "gender";
  const isDarkModeField = name === "darkMode";
  const isNationalityField = name === "nationality";
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [countryInput, setCountryInput] = useState(value || "");
  const [highlightedCountryIndex, setHighlightedCountryIndex] = useState(-1);
  const hasJustCommittedRef = useRef(false);
  const nationalityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNationalityField) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        nationalityDropdownRef.current &&
        !nationalityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNationalityOpen(false);
        setHighlightedCountryIndex(-1);
        setCountryInput(value || "");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNationalityField, value]);

  useEffect(() => {
    if (!isNationalityField) return;
    if (!isNationalityOpen) {
      setCountryInput(value || "");
    }
  }, [isNationalityField, value]);

  const handleToggle = () => {
    const fakeEvent = {
      target: {
        name,
        value: value === "true" ? "false" : "true",
      },
    } as ChangeEvent<HTMLInputElement>;

    onChange(fakeEvent);
  };

  const selectedCountry = countries.find((country) => country.name === value);
  const nationalityInputValue = countryInput;
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countryInput.toLowerCase())
  );

  const commitNationality = (countryName: string) => {
    const fakeEvent = {
      target: {
        name,
        value: countryName,
      },
    } as ChangeEvent<HTMLInputElement | HTMLSelectElement>;

    hasJustCommittedRef.current = true;
    onChange(fakeEvent);
    setCountryInput(countryName);
    setHighlightedCountryIndex(-1);
    setIsNationalityOpen(false);
  };

  const handleNationalityBlur = () => {
    if (hasJustCommittedRef.current) {
      hasJustCommittedRef.current = false;
      return;
    }

    window.setTimeout(() => {
      const exactMatch = countries.find(
        (country) =>
          country.name.toLowerCase() === countryInput.trim().toLowerCase()
      );

      if (exactMatch) {
        commitNationality(exactMatch.name);
      } else {
        setCountryInput(value || "");
        setIsNationalityOpen(false);
        setHighlightedCountryIndex(-1);
      }
    }, 0);
  };

  const handleNationalityKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isNationalityOpen) {
        setIsNationalityOpen(true);
        setHighlightedCountryIndex(filteredCountries.length > 0 ? 0 : -1);
        return;
      }

      setHighlightedCountryIndex((prev) =>
        Math.min(prev + 1, filteredCountries.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isNationalityOpen) {
        setIsNationalityOpen(true);
        setHighlightedCountryIndex(Math.max(filteredCountries.length - 1, 0));
        return;
      }

      setHighlightedCountryIndex((prev) => Math.max(prev - 1, 0));
    }

    if (event.key === "Enter" && isNationalityOpen) {
      event.preventDefault();
      if (highlightedCountryIndex >= 0 && filteredCountries[highlightedCountryIndex]) {
        commitNationality(filteredCountries[highlightedCountryIndex].name);
        return;
      }

      if (filteredCountries.length > 0) {
        commitNationality(filteredCountries[0].name);
        return;
      }

      const exactMatch = countries.find(
        (country) =>
          country.name.toLowerCase() === countryInput.trim().toLowerCase()
      );
      if (exactMatch) {
        commitNationality(exactMatch.name);
      } else {
        setCountryInput(value || "");
        setIsNationalityOpen(false);
        setHighlightedCountryIndex(-1);
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsNationalityOpen(false);
      setHighlightedCountryIndex(-1);
      setCountryInput(value || "");
    }
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm border-b pb-2 last:border-none">
      <span className={`${disabled ? "text-gray-400" : "text-gray-500"}`}>
        {label}:
      </span>

      {/* 🌍 NATIONALITY */}
      {isNationalityField ? (
        <div ref={nationalityDropdownRef} className="relative w-full md:w-64">
          <div
            className={`flex w-full items-center gap-2 rounded-md border px-3 py-1.5 ${
              disabled
                ? "border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-300 bg-white"
            }`}
          >
            {selectedCountry ? (
              <img
                src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                alt={`${selectedCountry.name} flag`}
                className="h-4 w-6 rounded-sm object-cover"
              />
            ) : null}
            <input
              type="text"
              disabled={disabled}
              value={nationalityInputValue}
              onFocus={() => {
                setIsNationalityOpen(true);
                setHighlightedCountryIndex(filteredCountries.length > 0 ? 0 : -1);
                // Make keyboard typing replace current text immediately.
                window.setTimeout(() => {
                  const active = document.activeElement as HTMLInputElement | null;
                  active?.select();
                }, 0);
              }}
              onBlur={handleNationalityBlur}
              onChange={(event) => {
                setCountryInput(event.target.value);
                setHighlightedCountryIndex(0);
                if (!isNationalityOpen) setIsNationalityOpen(true);
              }}
              onKeyDown={handleNationalityKeyDown}
              placeholder="Select Country"
              className="w-full border-none bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setIsNationalityOpen((prev) => !prev);
                if (!isNationalityOpen) {
                  setHighlightedCountryIndex(filteredCountries.length > 0 ? 0 : -1);
                }
              }}
              className="text-xs"
            >
              ▼
            </button>
          </div>

          {isNationalityOpen && !disabled ? (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No country found
                </div>
              ) : null}

              {filteredCountries.map((country, index) => (
                <button
                  key={country.code}
                  type="button"
                  onMouseEnter={() => setHighlightedCountryIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commitNationality(country.name);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                    highlightedCountryIndex === index
                      ? "bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                    alt={`${country.name} flag`}
                    className="h-4 w-6 rounded-sm object-cover"
                  />
                  <span>{country.name}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : isGenderField ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full md:w-64 rounded-md border px-3 py-1.5 border-gray-300 focus:ring-2 focus:ring-black/20"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Transgender">Transgender</option>
        </select>
      ) : isDarkModeField ? (
        <div
          onClick={handleToggle}
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
            value === "true" ? "bg-black" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
              value === "true" ? "translate-x-6" : ""
            }`}
          />
        </div>
      ) : (
        <input
          type={isDateField ? "date" : "text"}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full md:w-64 rounded-md border px-3 py-1.5 ${
            disabled
              ? "border-gray-200 bg-gray-100 text-gray-400"
              : "border-gray-300 focus:ring-2 focus:ring-black/20"
          }`}
        />
      )}
    </div>
  );
};