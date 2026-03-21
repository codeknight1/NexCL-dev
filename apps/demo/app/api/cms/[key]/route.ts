import { NextResponse } from 'next/server';

import { getCmsStorage } from '../../../../lib/cmsStorage';

export const runtime = 'nodejs';

interface PatchBody {
  value: unknown;
}

function isPatchBody(body: unknown): body is PatchBody {
  return typeof body === 'object' && body !== null && 'value' in body;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ key: string }> },
) {
  // Rate limit stub (Stage 3)
  // TODO(Stage 3): plug in a real limiter once auth/story is defined.

  const { key } = await context.params;
  const canonical = decodeURIComponent(key);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isPatchBody(body)) {
    return NextResponse.json({ error: 'Body must include a "value" property.' }, { status: 400 });
  }
  const { value } = body;

  try {
    await getCmsStorage().patchKey(canonical, value);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
