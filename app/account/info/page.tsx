"use client";

import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import AvatarCropModal from "@/app/components/account/AvatarCropModal";
import { useProfileSettings } from "@/app/hooks/useProfileSettings";

export default function AccountInfoPage() {
  const { user, initialized, loading } = useAuth();
  const {
    form,
    previewAvatarUrl,
    cropImageSrc,
    fileInputKey,
    isSaving,
    isUploadingAvatar,
    isPageLoading,
    message,
    canRemoveAvatar,
    isCropOpen,
    setDisplayName,
    setPhone,
    setAvatarUrl,
    openAvatarCrop,
    applyAvatarCrop,
    cancelAvatarCrop,
    saveProfile,
    removeAvatar,
  } = useProfileSettings({
    user,
    initialized,
  });

  if (!initialized || loading || isPageLoading) {
    return (
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
        Loading personal info...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/75">
        Sign in to manage your profile.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background">
        <h2 className="text-2xl font-semibold">Personal Info</h2>
        <p className="mt-2 text-background/65">
          Update the profile details tied to your account.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveProfile();
          }}
          className="mt-6 grid gap-4"
        >
          <div className="flex items-center gap-4">
            {previewAvatarUrl ? (
              <Image
                src={previewAvatarUrl}
                alt="Profile preview"
                width={64}
                height={64}
                loading="eager"
                className="h-16 w-16 rounded-full object-cover object-center"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-xl font-bold text-sandstone">
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-background/55">
                Preview
              </p>
              <p className="mt-1 text-background/70">
                Upload a profile photo from your computer or paste an image URL.
              </p>
            </div>
          </div>

          <input
            type="text"
            value={form.displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
          />

          <input
            type="email"
            value={form.email}
            readOnly
            className="rounded-xl border border-background/15 bg-sandstone/40 px-4 py-3 outline-none opacity-80"
          />

          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={14}
            value={form.phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="(555) 555-5555"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-background/75">
              Upload profile photo from your computer
            </label>
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={(event) =>
                void openAvatarCrop(event.target.files?.[0] ?? null)
              }
              className="block w-full rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-background file:px-4 file:py-2 file:text-sandstone"
            />
          </div>

          <input
            type="text"
            value={form.avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="Optional: paste a profile photo URL instead"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving || isUploadingAvatar || isCropOpen}
              className="w-fit rounded-xl border border-background/15 bg-background px-5 py-3 font-semibold text-sandstone transition hover:opacity-90 disabled:opacity-60"
            >
              {isUploadingAvatar
                ? "Uploading photo..."
                : isSaving
                  ? "Saving..."
                  : "Save Changes"}
            </button>

            {canRemoveAvatar ? (
              <button
                type="button"
                onClick={() => void removeAvatar()}
                disabled={isSaving || isUploadingAvatar || isCropOpen}
                className="w-fit rounded-xl border border-background/15 px-5 py-3 transition hover:bg-background hover:text-sandstone disabled:opacity-60"
              >
                Remove Photo
              </button>
            ) : null}
          </div>
        </form>

        {message ? (
          <p className="mt-4 text-sm text-background/80">{message}</p>
        ) : null}
      </div>

      <AvatarCropModal
        imageSrc={cropImageSrc ?? ""}
        isOpen={isCropOpen}
        isSaving={isSaving || isUploadingAvatar}
        onCancel={cancelAvatarCrop}
        onConfirm={applyAvatarCrop}
      />
    </>
  );
}