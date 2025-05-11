import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({ get: vi.fn() }),
}));

// Mock next/link
// Define more specific types for Next/Link props
type NextLinkProps = {
  children: React.ReactNode;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  locale?: string | false;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>;
  [key: string]: unknown; // For any other props, use unknown instead of any
};

vi.mock('next/link', () => {
  // Using a non-JSX function to avoid JSX parsing issues in the mock
  return function MockNextLink(props: NextLinkProps) {
    const { children, href, ...rest } = props;
    return {
      type: 'a',
      props: {
        href,
        ...rest,
        children,
      },
    };
  };
});

// Define MediaQueryList interface to avoid 'any' types
interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: (() => void) | null;
  addListener: ReturnType<typeof vi.fn>; // Deprecated
  removeListener: ReturnType<typeof vi.fn>; // Deprecated
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string): MockMediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Define router interface for better type safety
interface MockRouter {
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
  back: ReturnType<typeof vi.fn>;
  forward?: ReturnType<typeof vi.fn>;
  refresh?: ReturnType<typeof vi.fn>;
}

// Export mock functions for use in tests
export const mockRouter: MockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};
