import { NextResponse } from "next/server"
import { createDb } from "@/lib/db"
import { emails, users } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: "需要提供邮箱地址 (email 参数)" },
        { status: 400 }
      )
    }

    const db = createDb()

    const result = await db
      .select({
        id: emails.id,
        userId: emails.userId,
        address: emails.address,
        userName: users.name,
        createdAt: emails.createdAt
      })
      .from(emails)
      .leftJoin(users, eq(emails.userId, users.id))
      .where(eq(sql`LOWER(${emails.address})`, email.toLowerCase()))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json(
        { error: "邮箱不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to fetch email by address:', error)
    return NextResponse.json(
      { error: "获取邮箱信息失败" },
      { status: 500 }
    )
  }
}
