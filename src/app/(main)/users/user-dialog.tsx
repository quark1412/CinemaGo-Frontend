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
import { User, Role } from "@/types/User";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";
import { useI18n } from "@/contexts/I18nContext";

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
  const { t } = useI18n();

  const userSchema = z.object({
    fullname: z
      .string()
      .min(1, t("users.fullname.min1"))
      .min(2, t("users.fullname.min2"))
      .max(100, t("users.fullname.max100")),
    email: z.string().min(1, t("users.email.min1")).email(t("users.email.max")),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
      message: t("users.email.genderselect"),
    }),
    password: z
      .string()
      .min(8, t("users.password.min8"))
      .optional()
      .or(z.literal("")),
    role: z.nativeEnum(Role, {
      message: t("users.email.roleselect"),
    }),
  });

  type UserFormData = z.infer<typeof userSchema>;

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
            {isCreateMode
              ? t("users.createUser.title")
              : t("users.editUser.title")}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? t("users.createUser.description")
              : t("users.editUser.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("users.modal.full_name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("users.modal.enter_name")}
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
                      placeholder={t("users.modal.enter_email")}
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
                    <FormLabel>{t("users.modal.pass")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("users.modal.enter_pass")}
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
                    <FormLabel>{t("users.gender")}</FormLabel>
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
                        <SelectItem value="MALE">{t("users.male")}</SelectItem>
                        <SelectItem value="FEMALE">
                          {t("users.female")}
                        </SelectItem>
                        <SelectItem value="OTHER">
                          {t("users.other")}
                        </SelectItem>
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
                    <FormLabel>{t("users.role")}</FormLabel>
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
                        <SelectItem value="USER">{t("users.user")}</SelectItem>
                        <SelectItem value="ADMIN">
                          {t("users.admin")}
                        </SelectItem>
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
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isCreateMode
                    ? t("common.creating")
                    : t("common.updating")
                  : isCreateMode
                  ? t("users.createUser.title")
                  : t("users.updateUser.title")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
