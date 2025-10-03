"use client";

import { useState } from "react";

import { User } from "@/types/user";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { UserDialog } from "./user-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GetUsersParams } from "@/services/users/users";
import { useUsers, useArchiveUser, useRestoreUser } from "@/hooks/use-users";

export default function AllUsers() {
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
            ? "Archive User"
            : "Restore User"
        }
        description={
          confirmationDialog.action === "archive"
            ? `Are you sure you want to archive "${confirmationDialog.user?.fullname}"? This will prevent them from accessing the system.`
            : `Are you sure you want to restore "${confirmationDialog.user?.fullname}"? This will restore their access to the system.`
        }
        confirmText={
          confirmationDialog.action === "archive" ? "Archive" : "Restore"
        }
        variant={
          confirmationDialog.action === "archive" ? "archive" : "restore"
        }
        onConfirm={handleConfirmAction}
        loading={confirmationDialog.loading}
      />
    </div>
  );
}
