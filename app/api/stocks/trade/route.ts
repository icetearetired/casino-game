import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { stockId, type, quantity } = await request.json()

    if (!stockId || !type || !quantity || quantity <= 0) {
      return NextResponse.json({ message: "Invalid trade parameters" }, { status: 400 })
    }

    // Get stock info
    const [stock] = await sql`SELECT * FROM stocks WHERE id = ${stockId} AND is_active = true`
    if (!stock) {
      return NextResponse.json({ message: "Stock not found" }, { status: 404 })
    }

    // Get user info
    const [user] = await sql`SELECT balance, has_infinite_funds FROM users WHERE id = ${payload.userId}`
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const totalAmount = quantity * stock.current_price

    if (type === "buy") {
      // Check balance (skip for infinite funds)
      if (!user.has_infinite_funds && user.balance < totalAmount) {
        return NextResponse.json({ message: "Insufficient balance" }, { status: 400 })
      }

      // Deduct balance (unless infinite funds)
      if (!user.has_infinite_funds) {
        await sql`UPDATE users SET balance = balance - ${totalAmount} WHERE id = ${payload.userId}`
      }

      // Update or insert stock holding
      const [existingHolding] = await sql`
        SELECT * FROM user_stocks WHERE user_id = ${payload.userId} AND stock_id = ${stockId}
      `

      if (existingHolding) {
        // Calculate new average price
        const totalShares = existingHolding.quantity + quantity
        const totalCost = existingHolding.quantity * existingHolding.average_buy_price + totalAmount
        const newAvgPrice = totalCost / totalShares

        await sql`
          UPDATE user_stocks 
          SET quantity = ${totalShares}, average_buy_price = ${newAvgPrice}, updated_at = NOW()
          WHERE user_id = ${payload.userId} AND stock_id = ${stockId}
        `
      } else {
        await sql`
          INSERT INTO user_stocks (user_id, stock_id, quantity, average_buy_price)
          VALUES (${payload.userId}, ${stockId}, ${quantity}, ${stock.current_price})
        `
      }
    } else if (type === "sell") {
      // Check if user owns enough shares
      const [holding] = await sql`
        SELECT * FROM user_stocks WHERE user_id = ${payload.userId} AND stock_id = ${stockId}
      `

      if (!holding || holding.quantity < quantity) {
        return NextResponse.json({ message: "Not enough shares to sell" }, { status: 400 })
      }

      // Add balance
      await sql`UPDATE users SET balance = balance + ${totalAmount} WHERE id = ${payload.userId}`

      // Update holding
      const newQuantity = holding.quantity - quantity
      if (newQuantity === 0) {
        await sql`DELETE FROM user_stocks WHERE user_id = ${payload.userId} AND stock_id = ${stockId}`
      } else {
        await sql`
          UPDATE user_stocks SET quantity = ${newQuantity}, updated_at = NOW()
          WHERE user_id = ${payload.userId} AND stock_id = ${stockId}
        `
      }
    }

    // Record transaction
    await sql`
      INSERT INTO stock_transactions (user_id, stock_id, transaction_type, quantity, price_per_share, total_amount)
      VALUES (${payload.userId}, ${stockId}, ${type}, ${quantity}, ${stock.current_price}, ${totalAmount})
    `

    return NextResponse.json({
      success: true,
      totalAmount,
      pricePerShare: stock.current_price,
    })
  } catch (error) {
    console.error("Error executing trade:", error)
    return NextResponse.json({ message: "Failed to execute trade" }, { status: 500 })
  }
}
