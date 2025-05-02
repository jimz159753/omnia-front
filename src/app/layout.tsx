import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omnia"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
