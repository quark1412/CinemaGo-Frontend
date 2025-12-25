"use client";

import { useState } from "react";

import { User } from "@/types/user";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { UserDialog } from "./user-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GetUsersParams } from "@/services/users";
import { useUsers, useArchiveUser, useRestoreUser } from "@/hooks/use-users";
import { useI18n } from "@/contexts/I18nContext";

export default function AllUsers() {
  const { t } = useI18n();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    user: User | null;
    action: "archive" | "restore";
    loading: boolean;
  }>({
    open: false,
    user: null,
    action: "archive",
    loading: false,
  });
  const [currentParams, setCurrentParams] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
  });

  // Use React Query hooks
  const { data, isLoading, refetch } = useUsers(currentParams);
  const archiveMutation = useArchiveUser();
  const restoreMutation = useRestoreUser();

  const users = data?.data || [];
  const pagination = data?.pagination || {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleArchiveClick = (user: User) => {
    setConfirmationDialog({
      open: true,
      user,
      action: "archive",
      loading: false,
    });
  };

  const handleRestoreClick = (user: User) => {
    setConfirmationDialog({
      open: true,
      user,
      action: "restore",
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.user) return;

    setConfirmationDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (confirmationDialog.action === "archive") {
        await archiveMutation.mutateAsync(confirmationDialog.user.id);
      } else {
        await restoreMutation.mutateAsync(confirmationDialog.user.id);
      }
      setConfirmationDialog({
        open: false,
        user: null,
        action: "archive",
        loading: false,
      });
    } catch (error: any) {
      setConfirmationDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentParams({ page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    setCurrentParams({ page: 1, limit: currentParams.limit, search });
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onBan: handleArchiveClick,
    onUnban: handleRestoreClick,
  });

  return (
    <div className="h-full">
      <DataTable
        columns={columns}
        data={users}
        onCreateClick={handleCreateClick}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        loading={isLoading}
      />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSuccess={handleDialogSuccess}
      />

      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.action === "archive"
            ? t("users.archiveUser.title")
            : t("users.restoreUser.title")
        }
        description={
          confirmationDialog.action === "archive"
            ? `${t("users.archiveUser.description")} ${
                confirmationDialog.user?.fullname
              } ${t("users.archiveUser.confirmText")}`
            : `${t("users.restoreUser.description")} ${
                confirmationDialog.user?.fullname
              } ${t("users.restoreUser.confirmText")}`
        }
        confirmText={
          confirmationDialog.action === "archive"
            ? t("common.actions.archive")
            : t("common.actions.restore")
        }
        variant={
          confirmationDialog.action === "archive" ? "archive" : "restore"
        }
        cancelText={t("common.cancel")}
        onConfirm={handleConfirmAction}
        loading={confirmationDialog.loading}
      />
    </div>
  );
}
