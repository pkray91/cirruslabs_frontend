import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GUARD AI — Policy Assistant and Compliance Management",
  description: "GUARD AI delivers cutting-edge artificial intelligence for enterprise security, threat detection, and intelligent defense systems.",
  keywords: ["Guard AI", "AI security", "artificial intelligence", "enterprise security", "threat detection"],
  openGraph: {
    title: "GUARD AI — Next-Gen AI Security Intelligence",
    description: "Cutting-edge AI for enterprise security and intelligent defense.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}


