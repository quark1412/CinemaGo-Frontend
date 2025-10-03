"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Role } from "@/types/user";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";

const userSchema = z.object({
  fullname: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select a gender",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  role: z.nativeEnum(Role, {
    message: "Please select a role",
  }),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isCreateMode = !user;

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullname: "",
      email: "",
      gender: "MALE",
      password: "",
      role: Role.USER,
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          fullname: user.fullname,
          email: user.email,
          gender: user.gender as "MALE" | "FEMALE" | "OTHER",
          password: "",
          role: user.role,
        });
      } else {
        form.reset({
          fullname: "",
          email: "",
          gender: "MALE",
          password: "",
          role: Role.USER,
        });
      }
    }
  }, [open, user, form]);

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);

    try {
      if (isCreateMode) {
        await createMutation.mutateAsync({
          fullname: data.fullname,
          email: data.email,
          gender: data.gender,
          password: data.password!,
          role: data.role === Role.ADMIN ? "ADMIN" : "USER",
        });
      } else {
        await updateMutation.mutateAsync({
          id: user!.id,
          data: {
            fullname: data.fullname,
            gender: data.gender,
            role: data.role === Role.ADMIN ? "ADMIN" : "USER",
          },
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      // Error handling is done in the mutation hooks
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? "Create New User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? "Create a new user account with the information below."
              : "Update the user information and role below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      {...field}
                      disabled={isLoading || !isCreateMode}
                      className={!isCreateMode ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCreateMode && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(
                          value === "ADMIN" ? Role.ADMIN : Role.USER
                        )
                      }
                      value={field.value === Role.ADMIN ? "ADMIN" : "USER"}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isCreateMode
                    ? "Creating..."
                    : "Updating..."
                  : isCreateMode
                  ? "Create User"
                  : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
