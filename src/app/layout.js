import './globals.css';
import Footer from '../components/Footer';
import ScrollToTopButton from '../components/ScrollToTopButton';
import Navbar from '../components/Navbar';
import * as Constants from '../constants';

export const metadata = {
  metadataBase: new URL(Constants.SITE),

  title: 'Evolution X',
  description: 'Evolution X - #KeepEvolving',

  openGraph: {
    title: 'Evolution X',
    description: 'Evolution X - #KeepEvolving',
    url: Constants.SITE,
    siteName: 'Evolution X',
    images: '/Banner.jpg',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@evolutionxrom',
    creator: '@evolutionxrom',
    title: 'Evolution X',
    description: 'Evolution X - #KeepEvolving',
    images: '/Banner.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col tracking-wide text-white antialiased">
        <ScrollToTopButton />

        <Navbar />

        <div className='flex-1 lg:mx-auto lg:min-w-[64rem] lg:max-w-[90rem]'>
          <main className='mb-14 mt-7 sm:mb-14 sm:mt-14 lg:mb-28 2xl:mt-28 flex flex-col gap-12 sm:gap-20 xl:gap-28'>
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  );
}
