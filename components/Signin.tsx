"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setIsLogged, setUser } from "@/provider/redux/authSlice";
import { useRouter } from "next/navigation";
import { LoaderIcon } from "lucide-react";
import { forgotPassword, signInWithFirebase } from "@/utils/firebase";

const Signin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSignIn = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await signInWithFirebase(form.email, form.password);
      if (user) {
        toast("Sign in successful");
        dispatch(setUser(user)); // Update the user in the Redux store
        dispatch(setIsLogged(true)); // Set isLogged to true
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast(error.message);
      } else {
        // Handle cases where the error is not an Error object
        console.error("An unexpected error occurred");
        toast("An unexpected error occurred");
      }
      dispatch(setIsLogged(false));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!form.email) {
        toast("Please enter your email");
        return;
      }
      await forgotPassword(form.email);
      toast("Password reset link has been sent to your email");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast(error.message);
      } else {
        // Handle cases where the error is not an Error object
        console.error("An unexpected error occurred");
        toast("An unexpected error occurred");
      }
      dispatch(setIsLogged(false));
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
              onChange={handleInputChange}
              value={form.email}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#"
                onClick={handleResetPassword}
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              onChange={handleInputChange}
              value={form.password}
            />
          </div>
          <Button type="submit" onClick={handleSignIn} className="w-full">
            {submitting ? <LoaderIcon className="animate-spin" /> : "Login"}
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Signin;
