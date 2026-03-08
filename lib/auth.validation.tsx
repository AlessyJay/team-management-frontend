"use client";

import { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginRequest } from "@/queries/auth.query";
import { toast } from "sonner";

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
      console.log("Signup Data:", data);

      // await signupAction(data)
      // handle response here
    });
  };

  const signinOnSubmit = (data: LoginSchemaType) => {
    startTransition(async () => {
      const res = await LoginRequest({
        email: data.email,
        password: data.password,
      });

      if (res) {
        toast("Login successful", { position: "bottom-right" });
        console.log(res);
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
