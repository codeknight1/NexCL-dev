import { NextResponse } from 'next/server';

import { getCmsStorage } from '../../../lib/cmsStorage';

export const runtime = 'nodejs';

export async function GET() {
  const doc = await getCmsStorage().readAll();
  return NextResponse.json(doc, { status: 200 });
}

