"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "./Input";
import { AwButton } from "./ui/AwButton";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export default function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Form submitted with data:", data);
      
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-[53px] w-full">
      {/* Intro */}
      <div className="flex flex-col">
        <h2 className="font-heading font-bold text-3xl md:text-[32px] text-primary-default leading-normal">
          Login
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7 items-end">
        <Input
          label="Email"
          type="email"
          placeholder="Example@email.com"
          {...register("email")}
          error={errors.email?.message}
        />
        
        <AwButton variant="primary" type="submit" loading={isSubmitting} block>
          Avançar
        </AwButton>
      </form>
    </div>
  );
}
