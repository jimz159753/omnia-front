import { getPrisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { hashPassword, validateEmail, validatePassword } from "@/utils/auth";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
  tenantSlug?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  tenantSlug: string;
}

// JWT secret key (in production, use environment variable)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

export const auth = {
  // Register a new user (requires tenant context)
  async register(email: string, password: string, tenantSlug: string): Promise<AuthResult> {
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

      const { getPrismaForTenant } = await import("@/lib/db");
      const prisma = getPrismaForTenant(tenantSlug);

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
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { success: true, user, tenantSlug };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed" };
    }
  },

  // Login user with tenant context
  async login(email: string, password: string, tenantSlug: string): Promise<AuthResult> {
    try {
      const { getPrismaForTenant } = await import("@/lib/db");
      const prisma = getPrismaForTenant(tenantSlug);
      
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

      // Create JWT token with tenant info
      const token = this.createToken(user.id, user.email, tenantSlug);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          avatar: user.avatar || undefined,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        tenantSlug,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    }
  },

  // Create a JWT token with tenant info
  createToken(userId: string, email: string, tenantSlug: string = "dev"): string {
    return jwt.sign({ userId, email, tenantSlug }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  },

  // Verify JWT token and return full payload including tenant
  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
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

  // Get user by token (uses tenant from token)
  async getUserByToken(token: string): Promise<{ user: User | null; tenantSlug: string | null }> {
    const session = this.verifyToken(token);

    if (!session) {
      return { user: null, tenantSlug: null };
    }

    try {
      const { getPrismaForTenant } = await import("@/lib/db");
      const prisma = getPrismaForTenant(session.tenantSlug);
      
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { user, tenantSlug: session.tenantSlug };
    } catch (error) {
      console.error("Error fetching user:", error);
      return { user: null, tenantSlug: null };
    }
  },
};
