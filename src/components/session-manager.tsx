"use client";

import { ConfirmationDialog } from "~/components/ui/confirmation-dialog";
import { useSessionManager } from "~/hooks/use-session-manager";

interface SessionManagerProps {
  inactivityTimeoutMinutes?: number;
  warningMinutesBefore?: number;
  logoutOnClose?: boolean;
  enableWarning?: boolean;
}

export function SessionManager({
  inactivityTimeoutMinutes = 30,
  warningMinutesBefore = 5,
  logoutOnClose = true,
  enableWarning = true,
}: SessionManagerProps) {
  const {
    showWarning,
    timeoutMinutes,
    handleStayLoggedIn,
    handleConfirmLogout,
  } = useSessionManager({
    inactivityTimeoutMinutes,
    warningMinutesBefore,
    logoutOnClose,
    enableWarning,
  });

  return (
    <ConfirmationDialog
      isOpen={showWarning}
      title="Session Timeout Warning"
      description={`You've been inactive for a while. Your session will expire in ${timeoutMinutes} minute${timeoutMinutes !== 1 ? "s" : ""}. Do you want to stay logged in?`}
      confirmText="Stay Logged In"
      cancelText="Logout"
      isDangerous={false}
      onConfirm={handleStayLoggedIn}
      onCancel={handleConfirmLogout}
    />
  );
}
