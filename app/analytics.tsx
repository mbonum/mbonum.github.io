import Script from 'next/script'

const cloudflareAnalyticsToken =
  process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN

export function Analytics() {
  if (!cloudflareAnalyticsToken) {
    return null
  }

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: cloudflareAnalyticsToken })}
      strategy="afterInteractive"
    />
  )
}
