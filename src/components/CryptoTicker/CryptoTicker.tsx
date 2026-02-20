'use client'
import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface CryptoData {
    symbol: string
    name: string
    price: number
    prevPrice: number
    change24h: number
    icon: string
}

const CRYPTO_SYMBOLS = [
    { symbol: 'BTCUSDT', name: 'BTC', icon: '₿' },
    { symbol: 'ETHUSDT', name: 'ETH', icon: 'Ξ' },
    { symbol: 'BNBUSDT', name: 'BNB', icon: '◆' },
    { symbol: 'SOLUSDT', name: 'SOL', icon: '◎' },
    { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
    { symbol: 'DOGEUSDT', name: 'DOGE', icon: 'Ð' },
]

export default function CryptoTicker() {
    const [cryptos, setCryptos] = useState<CryptoData[]>([])
    const [loading, setLoading] = useState(true)
    const wsRef = useRef<WebSocket | null>(null)
    const pricesRef = useRef<Map<string, CryptoData>>(new Map())

    // Charger les prix initiaux + variation 24h via l'API REST Binance
    useEffect(() => {
        const fetchInitialPrices = async () => {
            try {
                const symbols = CRYPTO_SYMBOLS.map(s => s.symbol)
                const tickerRes = await fetch(
                    `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`
                )
                const tickers = await tickerRes.json()

                const initialData: CryptoData[] = tickers.map((ticker: any) => {
                    const meta = CRYPTO_SYMBOLS.find(s => s.symbol === ticker.symbol)!
                    return {
                        symbol: ticker.symbol,
                        name: meta.name,
                        price: parseFloat(ticker.lastPrice),
                        prevPrice: parseFloat(ticker.lastPrice),
                        change24h: parseFloat(ticker.priceChangePercent),
                        icon: meta.icon,
                    }
                })

                // Trier par market cap (ordre du tableau CRYPTO_SYMBOLS)
                const sorted = CRYPTO_SYMBOLS.map(s =>
                    initialData.find(d => d.symbol === s.symbol)!
                ).filter(Boolean)

                sorted.forEach(c => pricesRef.current.set(c.symbol, c))
                setCryptos(sorted)
                setLoading(false)
            } catch (error) {
                console.error('❌ Erreur chargement prix crypto:', error)
                setLoading(false)
            }
        }

        fetchInitialPrices()
    }, [])

    // WebSocket pour les mises à jour en temps réel
    useEffect(() => {
        if (cryptos.length === 0) return

        const streams = CRYPTO_SYMBOLS
            .map(s => `${s.symbol.toLowerCase()}@miniTicker`)
            .join('/')

        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
        wsRef.current = ws

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data)
            const data = msg.data
            if (!data || !data.s) return

            const symbol = data.s
            const existing = pricesRef.current.get(symbol)
            if (!existing) return

            const newPrice = parseFloat(data.c)
            const updated: CryptoData = {
                ...existing,
                prevPrice: existing.price,
                price: newPrice,
                change24h: parseFloat(data.P),
            }

            pricesRef.current.set(symbol, updated)

            // Mise à jour de l'état avec l'ordre d'origine
            const newCryptos = CRYPTO_SYMBOLS
                .map(s => pricesRef.current.get(s.symbol)!)
                .filter(Boolean)
            setCryptos([...newCryptos])
        }

        ws.onerror = (err) => console.error('WebSocket error:', err)

        return () => {
            ws.close()
            wsRef.current = null
        }
    }, [cryptos.length > 0])

    // Formatage du prix
    const formatPrice = (price: number) => {
        if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        if (price >= 1) return price.toFixed(2)
        return price.toFixed(4)
    }

    if (loading) {
        return (
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-yellow-400 animate-pulse" />
                        <span className="text-white/70 text-sm font-bold">Marché Crypto</span>
                    </div>
                    <span className="text-white/40 text-xs">Chargement...</span>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                                <div className="w-12 h-4 rounded bg-white/10 animate-pulse"></div>
                            </div>
                            <div className="w-20 h-4 rounded bg-white/10 animate-pulse"></div>
                            <div className="w-16 h-6 rounded bg-white/10 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-bold text-sm">Marché Crypto</span>
                    <span className="text-white/40 text-xs">Live</span>
                </div>
                <div className="flex items-center gap-4 text-white/40 text-xs font-semibold">
                    <span>Dernier prix</span>
                    <span>Var% 24h</span>
                </div>
            </div>

            {/* Crypto List */}
            <div className="divide-y divide-white/5">
                {cryptos.map((crypto) => {
                    const isUp = crypto.change24h >= 0
                    const priceFlash = crypto.price !== crypto.prevPrice
                    const flashUp = crypto.price > crypto.prevPrice

                    return (
                        <div
                            key={crypto.symbol}
                            className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors duration-150"
                        >
                            {/* Nom + icône */}
                            <div className="flex items-center gap-3 min-w-[80px]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${crypto.name === 'BTC' ? 'bg-orange-500/20 text-orange-400' :
                                        crypto.name === 'ETH' ? 'bg-blue-500/20 text-blue-400' :
                                            crypto.name === 'BNB' ? 'bg-yellow-500/20 text-yellow-400' :
                                                crypto.name === 'SOL' ? 'bg-purple-500/20 text-purple-400' :
                                                    crypto.name === 'XRP' ? 'bg-gray-500/20 text-gray-300' :
                                                        'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {crypto.icon}
                                </div>
                                <div>
                                    <span className="text-white font-bold text-sm">{crypto.name}</span>
                                    <span className="text-white/30 text-xs ml-1">/USDT</span>
                                </div>
                            </div>

                            {/* Prix */}
                            <div className="text-right">
                                <span className={`text-white font-bold text-sm tabular-nums transition-colors duration-300 ${priceFlash ? (flashUp ? 'text-green-400' : 'text-red-400') : 'text-white'
                                    }`}>
                                    ${formatPrice(crypto.price)}
                                </span>
                            </div>

                            {/* Variation 24h */}
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold min-w-[75px] justify-center ${isUp
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span>{isUp ? '+' : ''}{crypto.change24h.toFixed(2)}%</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
