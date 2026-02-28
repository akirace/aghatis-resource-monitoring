import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In — Aghatis Resource Monitor',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
