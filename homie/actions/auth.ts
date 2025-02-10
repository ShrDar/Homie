"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/prisma";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"

const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const login = async (provider: string) => {
  await signIn(provider, { redirectTo: "/" });
  revalidatePath("/");
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
  revalidatePath("/");
};

export const loginWithCreds = async (email: string, password: string) => {
  const rawFormData = {
    email: email,
    password: password,
    role: "USER",
    redirectTo: "/",
  };
  const existingUser = await getUserByEmail(email);

  try {
    await signIn("credentials", rawFormData);
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
  revalidatePath("/");
};

export const signupWithCreds = async (email: string, password: string, name: string, image: string) => {
  const existingUser = await getUserByEmail(email);
  
  if (existingUser) {
    return { error: "Homie/User already exists !" };
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name,
        image
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account" };
  }
};