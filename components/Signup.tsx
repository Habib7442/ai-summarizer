"use client";
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
import { signUpWithEmailPassword } from "@/utils/firebase";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";

interface UserCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const Signup = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const resetForm = () => setForm(initialFormState);

  const validateForm = ({
    firstName,
    lastName,
    email,
    password,
  }: UserCredentials) => {
    if (!firstName || !lastName || !email || !password) {
      toast("Please fill in all fields");
      return false;
    }
    // Add more validation logic as needed
    return true;
  };

  const signUp = async () => {
    setSubmitting(true);
    if (validateForm(form)) {
      try {
        const user = await signUpWithEmailPassword(form);

        if (user) {
          toast("Sign up successful, Please Login");
          resetForm(); // Reset the form on successful sign up
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error);
          toast(error.message); // Now it's safe to access the message property
        } else {
          // Handle cases where the error is not an Error object
          console.error("An unexpected error occurred");
          toast("An unexpected error occurred");
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      setSubmitting(false); // Stop submitting if validation fails
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                name="firstName"
                placeholder="Max"
                required
                onChange={handleChange}
                value={form.firstName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                name="lastName"
                placeholder="Robinson"
                required
                onChange={handleChange}
                value={form.lastName}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
              onChange={handleChange}
              value={form.email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              onChange={handleChange}
              value={form.password}
            />
          </div>
          <Button type="submit" onClick={signUp} className="w-full">
            {submitting ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              "Create an account"
            )}
          </Button>
          <Button variant="outline" className="w-full">
            Sign up with Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Signup;
