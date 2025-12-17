export interface Info {
  url: string;
  isCached: boolean;
  age: number;
  maxServerLifetime: number;
  maxBrowserLifetime: number;
  timeLeft: number;
}
