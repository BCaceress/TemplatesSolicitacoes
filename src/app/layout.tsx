import { UserProvider } from "@/contexts/UserContext";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Colet Sistemas - Templates",
  description: "Templates para solicitações da Colet Sistemas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={plusJakartaSans.variable}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
