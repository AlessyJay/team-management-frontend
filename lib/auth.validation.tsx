"use client";

import { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginRequest, RegisterRequest } from "@/queries/auth.query";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const SignupSchema = z
  .object({
    name: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type SignupSchemaType = z.infer<typeof SignupSchema>;
type LoginSchemaType = z.infer<typeof LoginSchema>;

const AuthValidation = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const signupForm = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signinForm = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupOnSubmit = (data: SignupSchemaType) => {
    startTransition(async () => {
      startTransition(async () => {
        try {
          await RegisterRequest({
            email: data.email,
            name: data.name,
            password: data.password,
          });

          toast.success("Login successful", { position: "bottom-right" });
          router.replace("/login");
        } catch (error) {
          console.error(error);
          toast.error("Email or password doesn't meet our requirements", {
            position: "bottom-right",
          });
        }
      });
    });
  };

  const signinOnSubmit = (data: LoginSchemaType) => {
    startTransition(async () => {
      try {
        await LoginRequest({
          email: data.email,
          password: data.password,
        });

        const redirectTo = searchParams.get("redirectTo") || "/";

        toast.success("Login successful", { position: "bottom-right" });
        router.replace(redirectTo);
      } catch (error) {
        console.error(error);
        toast.error("Invalid email or password", { position: "bottom-right" });
      }
    });
  };

  return {
    signupForm,
    signinForm,
    signupOnSubmit,
    signinOnSubmit,
    isPending,
  };
};

export default AuthValidation;
