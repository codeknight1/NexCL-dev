import { NextResponse } from 'next/server';

import { getCmsStorage } from '../../../../lib/cmsStorage';

export const runtime = 'nodejs';

function encodeSseEvent(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function encodeSseComment(comment: string) {
  return `: ${comment}\n\n`;
}

export async function GET(req: Request) {
  const { signal } = req;

  let lastJson: string | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (chunk: string) => controller.enqueue(encoder.encode(chunk));

      // Initial snapshot.
      try {
        const snapshot = await getCmsStorage().readAll();
        lastJson = JSON.stringify(snapshot);
        send(encodeSseEvent(snapshot));
      } catch {
        // If storage read fails, keep stream alive; client will retry/fallback.
        send(encodeSseComment('initial read failed'));
      }

      const interval = setInterval(async () => {
        if (signal.aborted) return;
        try {
          const snapshot = await getCmsStorage().readAll();
          const json = JSON.stringify(snapshot);
          if (json !== lastJson) {
            lastJson = json;
            send(encodeSseEvent(snapshot));
          } else {
            // Keepalive for proxies/timeouts.
            send(encodeSseComment('keepalive'));
          }
        } catch {
          send(encodeSseComment('tick failed'));
        }
      }, 2000);

      signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}

