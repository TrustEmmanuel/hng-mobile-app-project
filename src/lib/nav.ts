import { router, type Href } from 'expo-router';

export function go(path: string) {
  router.push(path as Href);
}

export function replace(path: string) {
  router.replace(path as Href);
}

export function back() {
  if (router.canGoBack()) router.back();
  else router.replace('/' as Href);
}
