import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getPrismaForTenant } from "@/lib/db";
import { masterPrisma } from "@/lib/master-db";
import { auth } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
  : "http://localhost:3000/api/auth/google/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("No authorization code received")}`
      );
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("Google OAuth not configured")}`
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("Could not get user information from Google")}`
      );
    }

    // --- SaaS Tenant Resolution ---
    
    // 1. Check if account exists in master database by Google ID
    let account = await masterPrisma.account.findUnique({
      where: { googleId: userInfo.id },
    });

    let tenantSlug: string;

    if (!account) {
      // 1.1 Check by email if they are an existing owner not yet linked by Google ID
      account = await masterPrisma.account.findFirst({
        where: { email: userInfo.email },
      });

      if (account) {
        // Link Google ID to existing account
        account = await masterPrisma.account.update({
          where: { id: account.id },
          data: { googleId: userInfo.id },
        });
        tenantSlug = account.slug;
      } else {
        // 1.2 New business owner - create account in master DB
        const emailPrefix = userInfo.email.split("@")[0];
        const baseSlug = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await masterPrisma.account.findUnique({ where: { slug: uniqueSlug } })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        tenantSlug = uniqueSlug;
        const dbName = `omnia_tenant_${tenantSlug}`;

        account = await masterPrisma.account.create({
          data: {
            googleId: userInfo.id,
            email: userInfo.email,
            ownerName: userInfo.name || "",
            slug: tenantSlug,
            name: userInfo.name || userInfo.email,
            dbName: dbName,
          },
        });
      }
    } else {
      tenantSlug = account.slug;
    }

    // 2. Ensure the tenant database exists and is migrated
    const { bootstrapTenantDatabase } = await import("@/lib/master-db");
    await bootstrapTenantDatabase(tenantSlug);

    // 3. Get/Create User in the Tenant Database
    const prisma = getPrismaForTenant(tenantSlug);
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          password: await generateRandomPassword(),
          name: userInfo.name || "",
          avatar: userInfo.picture || null,
          role: "admin", // Owner gets admin role
        },
      });
    } else {
      // Update user info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || userInfo.name || "",
          avatar: user.avatar || userInfo.picture || null,
        },
      });
    }

    // 3. Create JWT token with tenant info
    const token = auth.createToken(user.id, user.email, tenantSlug);

    // Redirect to dashboard with token in cookie
    const response = NextResponse.redirect(`${baseUrl}/dashboard/analytics`);
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent("Authentication failed")}`
    );
  }
}

async function generateRandomPassword(): Promise<string> {
  const bcrypt = await import("bcryptjs");
  const randomString = Math.random().toString(36).slice(-16) + 
                       Math.random().toString(36).slice(-16);
  return bcrypt.default.hash(randomString, 10);
}
