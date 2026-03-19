import { NextResponse } from 'next/server';

import { readCmsDoc } from '../../../lib/cmsFileStore';

export const runtime = 'nodejs';

export async function GET() {
  const doc = await readCmsDoc();
  return NextResponse.json(doc, { status: 200 });
}

