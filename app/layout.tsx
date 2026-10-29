import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'كل سنة وانتي طيبة يا ملك ♡',
  description: 'تجربة تفاعلية احتفالية خاصة بعيد ميلاد ملك — شجرة الحب ورسائل الصديقات',
  openGraph: {
    title: 'كل سنة وانتي طيبة يا ملك ♡',
    description: 'تجربة تفاعلية احتفالية خاصة بعيد ميلاد ملك — شجرة الحب ورسائل الصديقات',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'كل سنة وانتي طيبة يا ملك ♡',
    description: 'تجربة تفاعلية احتفالية خاصة بعيد ميلاد ملك — شجرة الحب ورسائل الصديقات',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning className="bg-[#080608] text-[#FFF5FA] antialiased selection:bg-[#FF4F9A]/30 selection:text-[#FFF5FA]">
        {children}
      </body>
    </html>
  );
}
