import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminUser } from "@/lib/auth/service";
import { handleApiError } from "@/lib/api/responses";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString()
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
