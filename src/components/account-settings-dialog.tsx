"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User, Settings, Camera } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { authService } from "@/services/users/auth";
import { useI18n } from "@/contexts/I18nContext";

const profileSchema = z.object({
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
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
        "Password must contain at least one number and one special character (!@#$%^&*)"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSettingsDialog({
  open,
  onOpenChange,
}: AccountSettingsDialogProps) {
  const { t } = useI18n();
  const { user, refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: "",
      email: "",
      gender: "MALE",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    if (open && user) {
      profileForm.reset({
        fullname: user.fullname,
        email: user.email,
        gender: user.gender as "MALE" | "FEMALE" | "OTHER",
      });
    }
  }, [open, user, profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      if (selectedAvatar) {
        const formData = new FormData();
        formData.append("avatar", selectedAvatar);
        formData.append("fullname", data.fullname);
        formData.append("gender", data.gender);

        await authService.updateProfile(formData);
      } else {
        await authService.updateProfile({
          fullname: data.fullname,
          gender: data.gender,
        });
      }

      toast.success(t("account.profileUpdated"));
      await refreshUser();
      setSelectedAvatar(null);
      setAvatarPreview(null);
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success(t("account.passwordChanged"));
      passwordForm.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.log(error);
      const message =
        error.response?.data?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    profileForm.reset();
    passwordForm.reset();
    setActiveTab("profile");
    setSelectedAvatar(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedAvatar(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("account.accountSettings")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 text-base"
            >
              <User className="h-5 w-5" />
              {t("account.profile")}
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 text-base"
            >
              <Settings className="h-5 w-5" />
              {t("account.security")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <p className="text-lg font-semibold">{t("account.profilePicture")}</p>
                <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage
                        src={avatarPreview || user.avatarUrl}
                        alt={user.fullname}
                      />
                      <AvatarFallback className="text-xl">
                        {user.fullname
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Profile Information Section */}
              <div className="space-y-4">
                <p className="text-lg font-semibold">{t("account.personalInformation")}</p>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="fullname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("account.fullName")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("account.enterFullName")}
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.email")}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={t("auth.enterEmail")}
                                {...field}
                                disabled={true}
                                className="bg-muted"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("account.gender")}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t("account.selectGender")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">{t("account.male")}</SelectItem>
                                <SelectItem value="FEMALE">{t("account.female")}</SelectItem>
                                <SelectItem value="OTHER">{t("account.other")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? t("common.updating") : t("account.updateProfile")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={passwordForm.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("account.currentPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("account.enterCurrentPassword")}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("account.newPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("account.enterNewPassword")}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("account.confirmNewPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("account.confirmNewPasswordPlaceholder")}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("account.passwordRequirements")}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• {t("account.passwordReq1")}</li>
                    <li>• {t("account.passwordReq2")}</li>
                    <li>• {t("account.passwordReq3")}</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t("account.changing") : t("account.changePassword")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
