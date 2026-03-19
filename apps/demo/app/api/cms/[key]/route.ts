import { NextResponse } from 'next/server';

import { getCmsStorage } from '../../../../lib/cmsStorage';

export const runtime = 'nodejs';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ key: string }> },
) {
  // Rate limit stub (Stage 3)
  // TODO(Stage 3): plug in a real limiter once auth/story is defined.
  void context;

  const { key } = await context.params;
  const canonical = decodeURIComponent(key);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const value = (body as any)?.value as unknown;

  try {
    await getCmsStorage().patchKey(canonical, value);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

