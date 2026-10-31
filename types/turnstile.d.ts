export {};

declare global {
  interface Window {
    turnstile?: {
      reset(widget?: string | HTMLElement): void;
      render(container: HTMLElement): string;
      remove(widget: string): void;
    };
  }
}
