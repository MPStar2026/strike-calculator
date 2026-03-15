// app/api/quote/route.js
// Server-side route — fetches Yahoo Finance directly, no CORS issues

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase().trim();

  if (!symbol) {
    return Response.json({ error: "Missing symbol" }, { status: 400 });
  }

  try {
    // Yahoo Finance v8 chart endpoint — reliable, no auth needed
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      next: { revalidate: 60 }, // cache for 60 seconds
    });

    if (!res.ok) {
      return Response.json({ error: `Yahoo Finance returned ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      const errMsg = data?.chart?.error?.description || "Symbol not found";
      return Response.json({ error: errMsg }, { status: 404 });
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? meta.previousClose ?? meta.chartPreviousClose;

    if (!price) {
      return Response.json({ error: "No price data available" }, { status: 404 });
    }

    return Response.json({
      symbol: meta.symbol || symbol,
      price: parseFloat(price),
      company: meta.longName || meta.shortName || symbol,
      currency: meta.currency || "USD",
      marketState: meta.marketState || "UNKNOWN",
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
