import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, MuseoModerno } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const museo = MuseoModerno({
  variable: "--font-museo",
  weight: "400",
  subsets: ["latin"],
});

const TITLE = "David Green — I build and use tools to make life easier";
const DESCRIPTION =
  "I hate busywork. I build and use tools to make life easier. Founder of Frequency, builder of platforms — NYU Stern BTE + CS.";

export const metadata: Metadata = {
  // TODO: swap to the production domain when deployed to Vercel
  metadataBase: new URL("https://david-green-portfolio.vercel.app"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "David Green" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#060807",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${grotesk.variable} ${museo.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
