"use client";

import { User, Role } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArchiveRestore,
  Ban,
  CheckCircle,
  Clipboard,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  User as UserIcon,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ColumnProps {
  onEdit: (user: User) => void;
  onBan: (user: User) => void;
  onUnban: (user: User) => void;
}

export const createColumns = ({
  onEdit,
  onBan,
  onUnban,
}: ColumnProps): ColumnDef<User>[] => [
  {
    accessorKey: "fullname",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.fullname} />
            <AvatarFallback>
              {user.fullname
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xs font-medium">{user.fullname}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => <div className="font-bold text-sm">Role</div>,
    cell: ({ row }) => {
      const role = row.original.role;
      const isAdmin = role === Role.ADMIN;
      return (
        <Badge variant={"secondary"} className="text-xs">
          {isAdmin ? (
            <ShieldCheck className="h-3 w-3 mr-1" />
          ) : (
            <UserIcon className="h-3 w-3 mr-1" />
          )}
          {isAdmin ? "ADMIN" : "USER"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "gender",
    header: () => <div className="font-bold text-sm">Gender</div>,
    cell: ({ row }) => {
      return <div className="text-xs">{row.original.gender}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: () => <div className="font-bold text-sm">Status</div>,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={`text-xs`}
        >
          {isActive ? (
            <>
              {/* <CheckCircle className="h-3 w-3 mr-1" /> */}
              Active
            </>
          ) : (
            <>
              {/* <XCircle className="h-3 w-3 mr-1" /> */}
              Inactive
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs">{formatDate(row.original.createdAt)}</div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs">{formatDate(row.original.updatedAt)}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only text-xs">Actions</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit(user)}
            >
              <Pencil className="text-primary" />
              <span className="text-xs">Edit User</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              <Clipboard className="text-primary" />
              <span className="text-xs">Copy User ID</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.isActive ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onBan(user)}
              >
                <Archive className="text-red-500" />
                <span className="text-xs text-red-500">Archive User</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onUnban(user)}
              >
                <ArchiveRestore className="text-green-500" />
                <span className="text-xs text-green-500">Restore User</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
