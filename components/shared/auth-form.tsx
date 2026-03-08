"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import AuthValidation from "@/lib/auth.validation";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import Link from "next/link";

interface AuthFormProps extends React.ComponentProps<typeof Card> {
  type: "signup" | "signin";
}

export function AuthForm({ type, ...props }: AuthFormProps) {
  const { signupForm, signinForm, signupOnSubmit, signinOnSubmit, isPending } =
    AuthValidation();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="flex h-dvh items-center justify-center">
      <Card
        {...props}
        className="m-6 h-fit w-full rounded-2xl sm:max-w-[50%] md:max-w-[30%] lg:max-w-[15%]"
      >
        {type === "signup" ? (
          <React.Fragment>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your information below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={signupForm.handleSubmit(signupOnSubmit)}>
                <FieldGroup>
                  <Controller
                    name="name"
                    control={signupForm.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          {...field}
                        />

                        <FieldError />
                      </Field>
                    )}
                  />

                  <Controller
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />

                        <FieldError />
                      </Field>
                    )}
                  />

                  <Controller
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            {...field}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeIcon size={20} />
                            ) : (
                              <EyeClosedIcon size={20} />
                            )}
                          </button>
                        </div>
                        <FieldDescription>
                          Must be at least 8 characters long.
                        </FieldDescription>
                      </Field>
                    )}
                  />

                  <Controller
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <Input
                          id="confirm-password"
                          type="password"
                          {...field}
                        />
                        <FieldDescription>
                          Please confirm your password.
                        </FieldDescription>
                      </Field>
                    )}
                  />
                  <FieldGroup>
                    <Field>
                      <Button type="submit">Create Account</Button>
                      <FieldDescription className="px-6 text-center">
                        Already have an account?{" "}
                        <Link href="/login">Sign in</Link>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </form>
            </CardContent>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <CardHeader>
              <CardTitle>Welcome Back!</CardTitle>
              <CardDescription>
                Enter your information below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={signinForm.handleSubmit(signinOnSubmit)}>
                <FieldGroup>
                  <Controller
                    control={signinForm.control}
                    name="email"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />

                        <FieldError />
                      </Field>
                    )}
                  />

                  <Controller
                    control={signinForm.control}
                    name="password"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            {...field}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeIcon size={20} />
                            ) : (
                              <EyeClosedIcon size={20} />
                            )}
                          </button>
                        </div>
                        <FieldDescription>
                          Must be at least 8 characters long.
                        </FieldDescription>
                      </Field>
                    )}
                  />
                  <FieldGroup>
                    <Field>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? (
                          <span className="animate-pulse">Signing In...</span>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                      <FieldDescription className="px-6 text-center">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup">Sign Up</Link>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </form>
            </CardContent>
          </React.Fragment>
        )}
      </Card>
    </div>
  );
}
