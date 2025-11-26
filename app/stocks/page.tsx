"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Briefcase, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface Stock {
  id: string
  symbol: string
  name: string
  current_price: number
  previous_price: number
  high_24h: number
  low_24h: number
  change_percent: number
  market_cap: number
}

interface UserStock {
  stock_id: string
  symbol: string
  name: string
  quantity: number
  average_buy_price: number
  current_price: number
}

export default function StocksPage() {
  const { user, balance, refreshUser } = useUser()
  const { toast } = useToast()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [portfolio, setPortfolio] = useState<UserStock[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [tradeAmount, setTradeAmount] = useState(1)
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false)
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")

  useEffect(() => {
    fetchStocks()
    if (user) {
      fetchPortfolio()
    }

    // Refresh prices periodically
    const interval = setInterval(() => {
      fetchStocks()
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [user])

  const fetchStocks = async () => {
    try {
      const response = await fetch("/api/stocks")
      if (response.ok) {
        const data = await response.json()
        setStocks(data)
      }
    } catch (error) {
      console.error("Error fetching stocks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/stocks/portfolio", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data)
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error)
    }
  }

  const executeTrade = async () => {
    if (!selectedStock || tradeAmount <= 0) return

    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/stocks/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stockId: selectedStock.id,
          type: tradeType,
          quantity: tradeAmount,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: `${tradeType === "buy" ? "Bought" : "Sold"} ${tradeAmount} ${selectedStock.symbol}`,
          description: `Total: ${result.totalAmount.toLocaleString()} coins`,
          className: "bg-amber-500 text-black",
        })
        fetchStocks()
        fetchPortfolio()
        refreshUser()
        setTradeDialogOpen(false)
        setTradeAmount(1)
      } else {
        const error = await response.json()
        toast({ title: "Trade Failed", description: error.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to execute trade", variant: "destructive" })
    }
  }

  const openTradeDialog = (stock: Stock, type: "buy" | "sell") => {
    setSelectedStock(stock)
    setTradeType(type)
    setTradeAmount(1)
    setTradeDialogOpen(true)
  }

  const portfolioValue = portfolio.reduce((sum, stock) => {
    return sum + stock.quantity * stock.current_price
  }, 0)

  const portfolioCost = portfolio.reduce((sum, stock) => {
    return sum + stock.quantity * stock.average_buy_price
  }, 0)

  const portfolioProfit = portfolioValue - portfolioCost

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-500">Stock Market</h1>
            <p className="text-zinc-400 mt-2">Trade virtual stocks and grow your portfolio</p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <span className="text-amber-500 font-bold">{(balance ?? 0).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Summary */}
        {user && portfolio.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Portfolio Value</p>
                    <p className="text-2xl font-bold">{portfolioValue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Total Invested</p>
                    <p className="text-2xl font-bold">{portfolioCost.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {portfolioProfit >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-zinc-400">Total Profit/Loss</p>
                    <p className={`text-2xl font-bold ${portfolioProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {portfolioProfit >= 0 ? "+" : ""}
                      {portfolioProfit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="market" className="space-y-6">
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="market">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Stock Market
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-zinc-400 border-b border-zinc-700">
                        <th className="pb-3 font-medium">Symbol</th>
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium text-right">Price</th>
                        <th className="pb-3 font-medium text-right">Change</th>
                        <th className="pb-3 font-medium text-right">24h High</th>
                        <th className="pb-3 font-medium text-right">24h Low</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((stock) => {
                        const change = ((stock.current_price - stock.previous_price) / stock.previous_price) * 100
                        const isPositive = change >= 0

                        return (
                          <tr key={stock.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30">
                            <td className="py-4">
                              <span className="font-bold text-amber-500">{stock.symbol}</span>
                            </td>
                            <td className="py-4 text-zinc-300">{stock.name}</td>
                            <td className="py-4 text-right font-mono font-bold">
                              {stock.current_price.toLocaleString()}
                            </td>
                            <td className={`py-4 text-right ${isPositive ? "text-green-500" : "text-red-500"}`}>
                              <span className="flex items-center justify-end gap-1">
                                {isPositive ? (
                                  <ArrowUpRight className="h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4" />
                                )}
                                {isPositive ? "+" : ""}
                                {change.toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-4 text-right text-zinc-400">{stock.high_24h?.toLocaleString() || "-"}</td>
                            <td className="py-4 text-right text-zinc-400">{stock.low_24h?.toLocaleString() || "-"}</td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => openTradeDialog(stock, "buy")}
                                  disabled={!user}
                                >
                                  Buy
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                                  onClick={() => openTradeDialog(stock, "sell")}
                                  disabled={!user}
                                >
                                  Sell
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-amber-500" />
                  My Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You don't own any stocks yet.</p>
                    <p className="text-sm mt-2">Start trading to build your portfolio!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-zinc-400 border-b border-zinc-700">
                          <th className="pb-3 font-medium">Symbol</th>
                          <th className="pb-3 font-medium">Shares</th>
                          <th className="pb-3 font-medium text-right">Avg Price</th>
                          <th className="pb-3 font-medium text-right">Current</th>
                          <th className="pb-3 font-medium text-right">Value</th>
                          <th className="pb-3 font-medium text-right">P/L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.map((holding) => {
                          const value = holding.quantity * holding.current_price
                          const cost = holding.quantity * holding.average_buy_price
                          const profit = value - cost
                          const profitPercent = (profit / cost) * 100

                          return (
                            <tr key={holding.stock_id} className="border-b border-zinc-700/50">
                              <td className="py-4">
                                <div>
                                  <span className="font-bold text-amber-500">{holding.symbol}</span>
                                  <p className="text-sm text-zinc-400">{holding.name}</p>
                                </div>
                              </td>
                              <td className="py-4 font-bold">{holding.quantity}</td>
                              <td className="py-4 text-right font-mono">
                                {holding.average_buy_price.toLocaleString()}
                              </td>
                              <td className="py-4 text-right font-mono">{holding.current_price.toLocaleString()}</td>
                              <td className="py-4 text-right font-bold">{value.toLocaleString()}</td>
                              <td className={`py-4 text-right ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {profit >= 0 ? "+" : ""}
                                {profit.toLocaleString()}
                                <span className="text-sm ml-1">({profitPercent.toFixed(1)}%)</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trade Dialog */}
        <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
          <DialogContent className="bg-zinc-800 border-zinc-700">
            <DialogHeader>
              <DialogTitle className={tradeType === "buy" ? "text-green-500" : "text-red-500"}>
                {tradeType === "buy" ? "Buy" : "Sell"} {selectedStock?.symbol}
              </DialogTitle>
            </DialogHeader>
            {selectedStock && (
              <div className="space-y-4 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Current Price</span>
                  <span className="font-bold">{selectedStock.current_price.toLocaleString()} coins</span>
                </div>

                <div>
                  <label className="text-sm text-zinc-400">Quantity</label>
                  <Input
                    type="number"
                    min={1}
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="bg-zinc-700 border-zinc-600 mt-1"
                  />
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-amber-500">
                    {(tradeAmount * selectedStock.current_price).toLocaleString()} coins
                  </span>
                </div>

                <Button
                  className={`w-full ${tradeType === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  onClick={executeTrade}
                >
                  {tradeType === "buy" ? "Buy" : "Sell"} {tradeAmount} shares
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
