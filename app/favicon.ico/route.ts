const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#0f172a"/>
  <path d="M18 20h28v8H28v6h14v8H28v12h-10V20Z" fill="#f8fafc"/>
</svg>
`.trim();

export async function GET() {
  return new Response(faviconSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
