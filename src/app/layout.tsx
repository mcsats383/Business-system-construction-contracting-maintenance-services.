import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Engineering Audit & Escrow', description: 'ระบบตรวจรับงานและจัดการเงินค้ำประกัน' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="th"><body>{children}</body></html>; }
