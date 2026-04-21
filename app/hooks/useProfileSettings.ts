"use client";

import { useEffect, useState } from "react";
import type { Area } from "react-easy-crop";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { digitsOnlyPhone, formatPhoneNumber } from "@/lib/phone";
import {
  createCroppedAvatarFile,
  readFileAsDataUrl,
} from "@/lib/avatar";
import { deleteAvatarObject, uploadAvatar } from "@/app/hooks/profileSettings/avatarStorage";

export type ProfileForm = {
  displayName: string;
  phone: string;
  avatarUrl: string;
  email: string;
};

type UseProfileSettingsArgs = {
  user: User | null;
  initialized: boolean;
};

export function useProfileSettings({ user, initialized }: UseProfileSettingsArgs) {
  const [form, setForm] = useState<ProfileForm>({
    displayName: "",
    phone: "",
    avatarUrl: "",
    email: "",
  });
  const [savedAvatarUrl, setSavedAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAvatarPreviewUrl, setSelectedAvatarPreviewUrl] = useState<string | null>(null);
  const [pendingCropImageSrc, setPendingCropImageSrc] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!initialized) {
        return;
      }

      if (!user) {
        setIsPageLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, phone, avatar_url, email")
        .eq("id", user.id)
        .maybeSingle();

      if (!error) {
        const nextAvatarUrl = data?.avatar_url ?? "";

        setForm({
          displayName: data?.display_name ?? "",
          phone: formatPhoneNumber(data?.phone ?? ""),
          avatarUrl: nextAvatarUrl,
          email: data?.email ?? user.email ?? "",
        });
        setSavedAvatarUrl(nextAvatarUrl);
      } else {
        setForm((current) => ({
          ...current,
          email: user.email ?? "",
        }));
        setSavedAvatarUrl("");
      }

      setIsPageLoading(false);
    }

    void loadProfile();
  }, [initialized, user]);

  useEffect(() => {
    return () => {
      if (selectedAvatarPreviewUrl) {
        URL.revokeObjectURL(selectedAvatarPreviewUrl);
      }

      if (pendingCropImageSrc) {
        URL.revokeObjectURL(pendingCropImageSrc);
      }
    };
  }, [selectedAvatarPreviewUrl, pendingCropImageSrc]);

  function clearSelectedAvatarPreview() {
    setSelectedAvatarPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  }

  function clearPendingCropImage() {
    setPendingCropImageSrc((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  }

  function clearSelectedAvatarFile() {
    setSelectedFile(null);
    clearSelectedAvatarPreview();
    clearPendingCropImage();
    setFileInputKey((current) => current + 1);
  }

  function openAvatarCrop(file: File | null) {
    if (!file) {
      clearSelectedAvatarFile();
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);

      clearPendingCropImage();
      setPendingCropImageSrc(previewUrl);
      setSelectedFile(file);
      setMessage(null);
    } catch (error) {
      clearSelectedAvatarFile();
      setMessage(
        error instanceof Error
          ? `Failed to open cropper: ${error.message}`
          : "Failed to open cropper.",
      );
    }
  }

  async function applyAvatarCrop(croppedAreaPixels: Area) {
    if (!selectedFile) {
      return;
    }

    try {
      const croppedFile = await createCroppedAvatarFile(selectedFile, croppedAreaPixels);
      const croppedPreviewUrl = await readFileAsDataUrl(croppedFile);

      clearSelectedAvatarPreview();
      clearPendingCropImage();

      setSelectedFile(croppedFile);
      setSelectedAvatarPreviewUrl(croppedPreviewUrl);
      setMessage(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Failed to crop profile photo: ${error.message}`
          : "Failed to crop profile photo.",
      );
    }
  }

  function cancelAvatarCrop() {
    clearPendingCropImage();

    if (!selectedAvatarPreviewUrl) {
      setSelectedFile(null);
      setFileInputKey((current) => current + 1);
    }
  }

  async function syncAuthMetadata(avatarUrl: string | null) {
    if (!user) {
      return null;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_url: avatarUrl,
        full_name: form.displayName.trim() || user.user_metadata?.full_name || null,
      },
    });

    return error;
  }

  async function saveProfile() {
    if (!user) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const previousAvatarUrl = savedAvatarUrl;
    let avatarUrl = form.avatarUrl.trim() || null;
    let uploadedAvatarUrl: string | null = null;

    try {
      if (selectedFile) {
        setIsUploadingAvatar(true);
        uploadedAvatarUrl = await uploadAvatar(user.id, selectedFile);
        avatarUrl = uploadedAvatarUrl;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? form.email,
          display_name: form.displayName.trim() || null,
          phone: digitsOnlyPhone(form.phone) || null,
          avatar_url: avatarUrl,
        },
        { onConflict: "id" },
      );

      if (profileError) {
        throw new Error(profileError.message);
      }

      const authError = await syncAuthMetadata(avatarUrl);

      if (previousAvatarUrl && previousAvatarUrl !== avatarUrl) {
        await deleteAvatarObject(previousAvatarUrl);
      }

      setForm((current) => ({
        ...current,
        phone: formatPhoneNumber(current.phone),
        avatarUrl: avatarUrl ?? "",
      }));
      setSavedAvatarUrl(avatarUrl ?? "");
      clearSelectedAvatarFile();

      setMessage(
        authError
          ? `Profile updated, but session metadata did not refresh: ${authError.message}`
          : "Profile updated.",
      );
    } catch (error) {
      if (uploadedAvatarUrl) {
        try {
          await deleteAvatarObject(uploadedAvatarUrl);
        } catch {
        }
      }

      setMessage(
        error instanceof Error
          ? `Failed to update profile photo: ${error.message}`
          : "Failed to update profile photo.",
      );
    } finally {
      setIsUploadingAvatar(false);
      setIsSaving(false);
    }
  }

  async function removeAvatar() {
    if (!user) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const previousAvatarUrl = savedAvatarUrl;

    try {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? form.email,
          display_name: form.displayName.trim() || null,
          phone: digitsOnlyPhone(form.phone) || null,
          avatar_url: null,
        },
        { onConflict: "id" },
      );

      if (profileError) {
        throw new Error(profileError.message);
      }

      const authError = await syncAuthMetadata(null);

      if (previousAvatarUrl) {
        await deleteAvatarObject(previousAvatarUrl);
      }

      setForm((current) => ({
        ...current,
        avatarUrl: "",
      }));
      setSavedAvatarUrl("");
      clearSelectedAvatarFile();

      setMessage(
        authError
          ? `Profile photo removed, but session metadata did not refresh: ${authError.message}`
          : "Profile photo removed.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Failed to remove profile photo: ${error.message}`
          : "Failed to remove profile photo.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    form,
    previewAvatarUrl: selectedAvatarPreviewUrl ?? form.avatarUrl,
    cropImageSrc: pendingCropImageSrc,
    fileInputKey,
    isSaving,
    isUploadingAvatar,
    isPageLoading,
    message,
    canRemoveAvatar: Boolean(savedAvatarUrl || selectedFile),
    isCropOpen: Boolean(pendingCropImageSrc),
    setDisplayName(value: string) {
      setForm((current) => ({
        ...current,
        displayName: value,
      }));
    },
    setPhone(value: string) {
      setForm((current) => ({
        ...current,
        phone: formatPhoneNumber(value),
      }));
    },
    setAvatarUrl(value: string) {
      setForm((current) => ({
        ...current,
        avatarUrl: value,
      }));
    },
    openAvatarCrop,
    applyAvatarCrop,
    cancelAvatarCrop,
    saveProfile,
    removeAvatar,
  };
}