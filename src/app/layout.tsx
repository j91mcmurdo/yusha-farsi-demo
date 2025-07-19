
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AdminDialog from '@/components/admin-dialog';
import { ConfirmationDialogProvider } from '@/components/confirmation-dialog';

export const metadata: Metadata = {
  title: 'Yusha Farsi Journey',
  description: 'A showcase of my Farsi learning journey.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa+Ink:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ConfirmationDialogProvider>
          {children}
          <Toaster />
          <AdminDialog />
        </ConfirmationDialogProvider>
      </body>
    </html>
  );
}
