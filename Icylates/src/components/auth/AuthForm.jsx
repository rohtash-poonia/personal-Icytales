"use client";
import {useRouter} from "next/navigation";
import {useEffect,useState} from "react";
import {useForm} from "react-hook-form";
import Link from "next/link";
import {useAuth} from "@/components/context/AuthContext";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import {safeReturnTo} from "@/lib/commerce.mjs";

export default function AuthForm({mode="login"}){
  const isRegister=mode==="register";
  const isAdmin=mode==="admin";
  const router=useRouter();
  const {user,loading,login,adminLogin,register:registerAction}=useAuth();
  const [error,setError]=useState("");
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm();
  const returnTo=()=>{
    const value=safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
    return isAdmin ? "/admin" : /^\/admin(?:\/|$|\?)/.test(value) ? '/' : value;
  };
  useEffect(()=>{
    if(!loading && user && (!isAdmin || user.role==="admin")){
      const target=safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
      router.replace(isAdmin ? "/admin" : /^\/admin(?:\/|$|\?)/.test(target) ? '/' : target);
    }
  },[user,loading,isAdmin,router]);
  const onSubmit=async data=>{
    setError("");
    try {
      const result=await (isRegister ? registerAction({name:data.name.trim(),email:data.email.trim(),password:data.password}) : (isAdmin ? adminLogin : login)({email:data.email.trim(),password:data.password}));
      if(isAdmin && result.role!=="admin"){setError("Admin access required. Please use an admin account.");return;}
      router.replace(returnTo());
    } catch(err){setError(err.message || "Unable to sign in. Please try again.");}
  };
  const title=isRegister ? "Create your account" : isAdmin ? "Admin Sign In" : "Login to IcyTales";
  if(loading)return <p role="status" className="py-20 text-center">Checking your session…</p>;
  return <div className="min-h-screen bg-[#F8F6FB] py-20 px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-md rounded-[32px] border border-[#E9DFEE] bg-white p-10 shadow-sm">
    <Link href="/" className="mb-6 inline-block berkshire text-2xl text-pink">IcyTales</Link>
    <h1 className="berkshire text-3xl text-slate-900">{title}</h1><p className="mt-2 text-sm text-slate-600">{isRegister ? "Join IcyTales to order your favorite ice creams." : isAdmin ? "Only admin users may access the dashboard." : "Access your account and manage your orders."}</p>
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      {isRegister && <Input label="Name" autoComplete="name" {...register("name",{required:"Name is required",maxLength:{value:100,message:"Use at most 100 characters"},validate:value=>!!value.trim() || "Name is required"})} error={errors.name?.message}/>}
      <Input label="Email" type="email" autoComplete="email" {...register("email",{required:"Email is required",maxLength:254,pattern:{value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,message:"Enter a valid email address"}})} error={errors.email?.message}/>
      <Input label="Password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} {...register("password",{required:"Password is required",...(isRegister ? {minLength:{value:8,message:"Password must be at least 8 characters"},maxLength:{value:72,message:"Use at most 72 characters"}} : {})})} error={errors.password?.message}/>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Button type="submit" theme="primary" width="w-full" height="h-[52px]" loading={isSubmitting} disabled={isSubmitting}>{isSubmitting ? "Please wait…" : isRegister ? "Sign Up" : "Sign In"}</Button>
    </form>
    {!isAdmin && <p className="mt-6 text-sm text-slate-600">{isRegister ? "Already have an account? " : "New here? "}<Link href={isRegister ? "/login" : "/register"} onClick={event=>{event.preventDefault();router.push(`${isRegister ? "/login" : "/register"}?returnTo=${encodeURIComponent(returnTo())}`);}} className="text-pink font-semibold">{isRegister ? "Sign in" : "Create an account"}</Link></p>}
    {isAdmin && <Link href="/login" className="inline-block mt-3 text-sm text-pink underline">Customer login</Link>}
  </div></div>;
}
