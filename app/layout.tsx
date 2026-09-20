import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nopoint4percent — Split UPI into ₹1,900 QR slips",
  description:
    "Scan a UPI QR, confirm the payee, then split the amount into scan-ready payment slips under ₹1,900.",
  applicationName: "nopoint4percent",
  openGraph: {
    title: "nopoint4percent — Split UPI into ₹1,900 QR slips",
    description:
      "Scan a UPI QR, confirm the payee, then split the amount into scan-ready payment slips under ₹1,900.",
    siteName: "nopoint4percent",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "nopoint4percent — Split UPI into ₹1,900 QR slips",
    description:
      "Scan a UPI QR, confirm the payee, then split the amount into scan-ready payment slips under ₹1,900.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-fog text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
