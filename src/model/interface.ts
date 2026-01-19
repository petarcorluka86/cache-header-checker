export interface Info {
  url: string;
  isCached: boolean | undefined;
  age: number | undefined;
  maxServerLifetime: number | undefined;
  maxBrowserLifetime: number | undefined;
  timeLeft: number | undefined;
}

export interface DependencyResult {
  url: string;
  info?: Info;
  error?: string;
}

export interface PredefinedDependency {
  name: string;
  url: string;
}

export interface PredefinedRoute {
  name: string;
  url: string;
  dependencies?: PredefinedDependency[];
}
