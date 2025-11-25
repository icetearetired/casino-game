import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(handler: (request: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get("authorization")
      const token = authHeader?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json({ message: "No token provided" }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 })
      }

      return handler(request, decoded.userId)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
  }
}

export function withAdminAuth(handler: (request: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get("authorization")
      const token = authHeader?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json({ message: "No token provided" }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 })
      }

      const { getUserById } = await import("./auth")
      const user = await getUserById(decoded.userId)

      if (!user || !user.is_admin) {
        return NextResponse.json({ message: "Admin access required" }, { status: 403 })
      }

      return handler(request, decoded.userId)
    } catch (error) {
      console.error("Admin auth middleware error:", error)
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
  }
}
