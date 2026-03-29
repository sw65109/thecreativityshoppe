"use client";

import { SyntheticEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type UseAccountSecurityArgs = {
  user: User | null;
};

export function useAccountSecurity({ user }: UseAccountSecurityArgs) {
  const accountEmail = user?.email ?? "";
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const newEmail = emailDraft ?? accountEmail;

  function setNewEmail(value: string) {
    setEmailDraft(value);
  }

  async function handleEmailSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setEmailMessage("You must be signed in to update your email.");
      return;
    }

    setIsUpdatingEmail(true);
    setEmailMessage(null);

    const trimmedEmail = newEmail.trim();

    const { error } = await supabase.auth.updateUser({ email: trimmedEmail });

    if (error) {
      setEmailMessage(`Failed to update email: ${error.message}`);
    } else {
      setEmailMessage(
        "Email update requested. Check both your current and new email for verification steps.",
      );
      setEmailDraft(trimmedEmail);
    }

    setIsUpdatingEmail(false);
  }

  async function handlePasswordSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setPasswordMessage("You must be signed in to update your password.");
      return;
    }

    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage(`Failed to update password: ${error.message}`);
    } else {
      setPasswordMessage("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    }

    setIsUpdatingPassword(false);
  }

  return {
    newEmail,
    setNewEmail,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isUpdatingEmail,
    isUpdatingPassword,
    emailMessage,
    passwordMessage,
    handleEmailSubmit,
    handlePasswordSubmit,
  };
}