import { useCMS } from '@devcms/core';

export function Hero() {
  const [title] = useCMS('homepage.hero.title', 'Welcome', {
    namespace: 'marketing',
    type: 'text',
    description: 'Hero title',
  });

  return <h1>{title}</h1>;
}

