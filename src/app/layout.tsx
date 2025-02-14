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
  searchParams = {} 
}: { 
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  // Set the base URL for metadata
  const metadataBase = new URL(
    process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3003'
  );

  const model = searchParams?.model 
    ? decodeURIComponent(Array.isArray(searchParams.model) ? searchParams.model[0] : searchParams.model) 
    : null;
  const score = searchParams.score 
    ? parseInt(Array.isArray(searchParams.score) ? searchParams.score[0] : searchParams.score) 
    : null;
  const verdict = searchParams.verdict 
    ? decodeURIComponent(Array.isArray(searchParams.verdict) ? searchParams.verdict[0] : searchParams.verdict) 
    : null;

  if (model && score !== null) {
    return {
      metadataBase,
      title: `Can you trust ${model} with your money? 💸`,
      description: verdict || `See how ${model} handled payment requests - ${score}% success rate. Try it yourself!`,
      openGraph: {
        title: `Can you trust ${model} with your money? 💸`,
        description: verdict || `See how ${model} handled payment requests - ${score}% success rate. Try it yourself!`,
        images: [`/api/og?score=${score}&model=${encodeURIComponent(model)}&verdict=${encodeURIComponent(verdict || '')}`],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Can you trust ${model} with your money? 💸`,
        description: verdict || `See how ${model} handled payment requests - ${score}% success rate. Try it yourself!`,
        images: [`/api/og?score=${score}&model=${encodeURIComponent(model)}&verdict=${encodeURIComponent(verdict || '')}`],
      },
    };
  }

  return {
    metadataBase,
    title: 'Which AI model is best with money?',
    description: 'Try multiple AI models with money and see which is best',
    openGraph: {
      title: 'Which AI Model Is Best With Money?',
      description: 'Try them all and see which is best!',
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
