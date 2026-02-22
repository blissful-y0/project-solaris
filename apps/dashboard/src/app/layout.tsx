import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppSWRProvider } from "@/components/layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOLARIS Dashboard",
  description: "PROJECT SOLARIS 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh bg-bg text-text antialiased">
        <AppSWRProvider>
          {children}
        </AppSWRProvider>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
