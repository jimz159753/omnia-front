import { getPrisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { hashPassword, validateEmail, validatePassword } from "@/utils/auth";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
}

// JWT secret key (in production, use environment variable)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

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

      const prisma = await getPrisma();

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
          name: true,
          avatar: true,
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
      const prisma = await getPrisma();
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      // Check if user has a password (invite flow)
      if (!user.password) {
        return { 
          success: false, 
          error: "Account not activated. Please check your email for the invitation link." 
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return { success: false, error: "Account is deactivated. Please contact support." };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return { success: false, error: "Invalid email or password" };
      }

      // Create JWT token
      const token = this.createToken(user.id, user.email);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          avatar: user.avatar || undefined,
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

  // Create a JWT token
  createToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  },

  // Verify JWT token
  verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };
      return decoded;
    } catch {
      return null;
    }
  },

  // Logout user (JWT tokens are stateless, so we just return success)
  logout(): void {
    // JWT tokens are stateless, so we don't need to do anything here
    // The client should remove the token from cookies
  },

  // Get user by token
  async getUserByToken(token: string): Promise<User | null> {
    const session = this.verifyToken(token);

    if (!session) {
      return null;
    }

    try {
      const prisma = await getPrisma();
      
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
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
