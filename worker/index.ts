/** Cloudflare Worker entry point for Vibe Archive. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { getSiteSettings } from "../db/site-settings";

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    const contentType = response.headers.get("content-type") ?? "";

    if (url.pathname !== "/" || request.method !== "GET" || !contentType.includes("text/html")) {
      return response;
    }
    if (typeof HTMLRewriter === "undefined") return response;

    try {
      const settings = await getSiteSettings(env.DB);
      const thumbnailUrl = settings.thumbnailUrl ? new URL(settings.thumbnailUrl, request.url).toString() : "";
      const faviconUrl = settings.faviconUrl ? new URL(settings.faviconUrl, request.url).toString() : "";

      let rewriter = new HTMLRewriter()
        .on("title", { element: (element) => element.setInnerContent(settings.title) })
        .on('meta[name="description"]', { element: (element) => element.setAttribute("content", settings.description) })
        .on('meta[property="og:title"]', { element: (element) => element.setAttribute("content", settings.title) })
        .on('meta[property="og:description"]', { element: (element) => element.setAttribute("content", settings.description) })
        .on('meta[name="twitter:title"]', { element: (element) => element.setAttribute("content", settings.title) })
        .on('meta[name="twitter:description"]', { element: (element) => element.setAttribute("content", settings.description) })
        .on('meta[name="twitter:card"]', { element: (element) => element.setAttribute("content", thumbnailUrl ? "summary_large_image" : "summary") })
        .on('meta[property="og:image"]', { element: (element) => thumbnailUrl ? element.setAttribute("content", thumbnailUrl) : element.remove() })
        .on('meta[property="og:image:alt"]', { element: (element) => thumbnailUrl ? element.setAttribute("content", `${settings.title} 썸네일`) : element.remove() })
        .on('meta[name="twitter:image"]', { element: (element) => thumbnailUrl ? element.setAttribute("content", thumbnailUrl) : element.remove() });

      if (faviconUrl) {
        rewriter = rewriter.on("head", {
          element: (element) => element.append(`<link rel="icon" href="${escapeAttribute(faviconUrl)}">`, { html: true }),
        });
      }

      return rewriter.transform(response);
    } catch {
      return response;
    }
  },
} satisfies ExportedHandler<Env>;

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default worker;
