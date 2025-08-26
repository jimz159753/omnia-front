import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { hashPassword, validateEmail, validatePassword } from "@/utils/auth";

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
}

// Simple in-memory session store (in production, use Redis or database)
const sessions = new Map<
  string,
  { userId: string; email: string; expires: number }
>();

export const auth = {
  // Register a new user
  async register(email: string, password: string): Promise<AuthResult> {
    try {
      // Validate input
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }

      if (!validateEmail(email)) {
        return {
          success: false,
          error: "Please provide a valid email address",
        };
      }

      if (!validatePassword(password)) {
        return {
          success: false,
          error:
            "Password must be at least 8 characters with uppercase, lowercase, and number",
        };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          success: false,
          error: "A user with this email already exists",
        };
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { success: true, user };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed" };
    }
  },

  // Login user
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return { success: false, error: "Invalid email or password" };
      }

      // Create session token
      const token = this.createSession(user.id, user.email);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    }
  },

  // Create a session
  createSession(userId: string, email: string): string {
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    sessions.set(token, { userId, email, expires });

    return token;
  },

  // Verify session token
  verifySession(token: string): { userId: string; email: string } | null {
    const session = sessions.get(token);

    if (!session || session.expires < Date.now()) {
      sessions.delete(token);
      return null;
    }

    return { userId: session.userId, email: session.email };
  },

  // Logout user
  logout(token: string): void {
    sessions.delete(token);
  },

  // Get user by token
  async getUserByToken(token: string): Promise<User | null> {
    const session = this.verifySession(token);

    if (!session) {
      return null;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },
};
