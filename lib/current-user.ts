import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { decryptSession } from "@/lib/session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await decryptSession(sessionToken);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
    },
  });

  if (
    !user ||
    !user.isActive ||
    user.employee.employmentStatus !== "ACTIVE"
  ) {
    return null;
  }

  return user;
}

