import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastDelivery",
  description: "приложение для отслеживания посылок практическая работа 2025",
  icons: {
    icon: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="scroll-container">{children}</body>
    </html>
  );
}
