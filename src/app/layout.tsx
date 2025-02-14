import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  // Check if this is a shared result
  const sharedData = searchParams?.share ? 
    JSON.parse(atob(Array.isArray(searchParams.share) ? searchParams.share[0] : searchParams.share)) : null;

  if (sharedData) {
    const successCount = sharedData.results.filter((r: { matchedExpectation: boolean }) => r.matchedExpectation).length;
    const totalTests = sharedData.results.length;
    const score = Math.round((successCount / totalTests) * 100);
    const modelName = sharedData.model?.split('/').pop()?.replace(/-/g, ' ') || 'AI';

    return {
      title: `Can you trust ${modelName} with your money? 💸`,
      description: sharedData.verdict || `See how ${modelName} handled payment requests - ${score}% success rate. Try it yourself!`,
      openGraph: {
        title: `Can you trust ${modelName} with your money? 💸`,
        description: sharedData.verdict || `See how ${modelName} handled payment requests - ${score}% success rate. Try it yourself!`,
        images: [`/api/og?score=${score}&model=${encodeURIComponent(modelName)}&verdict=${encodeURIComponent(sharedData.verdict || '')}`],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Can you trust ${modelName} with your money? 💸`,
        description: sharedData.verdict || `See how ${modelName} handled payment requests - ${score}% success rate. Try it yourself!`,
        images: [`/api/og?score=${score}&model=${encodeURIComponent(modelName)}&verdict=${encodeURIComponent(sharedData.verdict || '')}`],
      },
    };
  }

  return {
    title: 'AI Payment Testing Suite',
    description: 'Test how AI models handle payment requests and spending limits',
    openGraph: {
      title: 'AI Payment Testing Suite',
      description: 'Test how AI models handle payment requests and spending limits',
      images: ['/api/og'],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
