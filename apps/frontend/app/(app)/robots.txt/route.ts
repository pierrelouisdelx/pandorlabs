const URL = process.env.NEXT_PUBLIC_APP_URL || ''

function generateSiteMap(): string {
    return `User-agent: *

Sitemap: ${URL}/sitemap.xml`
}

export function GET(): Response {
    const body: string = generateSiteMap()

    return new Response(body)
}
