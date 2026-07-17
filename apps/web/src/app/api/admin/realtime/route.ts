import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** SSE endpoint: streams live visitor count every 10 seconds. */
export async function GET(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return new Response("forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        try {
          const fiveMinAgo = new Date(Date.now() - 5 * 60_000);
          const [online] = await db.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(DISTINCT COALESCE("userId", "ip", 'anon')) as count
            FROM "PageView" WHERE "createdAt" >= ${fiveMinAgo}
          `;
          const count = Number(online?.count ?? 0);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ count })}\n\n`));
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ count: 0 })}\n\n`));
        }
      };

      // Send immediately, then every 10s
      await send();
      const interval = setInterval(send, 10_000);

      // Clean up if client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
