import { InlineText } from '@devcms/core';

export default function Page() {
  return (
    <main>
      <InlineText path="homepage.hero.title" fallback="Welcome" namespace="marketing" />
    </main>
  );
}

