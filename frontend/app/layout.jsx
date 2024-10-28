import { ClerkProvider, RedirectToSignIn, SignedOut } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import PropTypes from 'prop-types';
import '../styles/globals.scss';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'Invoice Manager',
  description: 'A platform to manage your invoices',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        signIn: { baseTheme: dark },
      }}
    >
      <html lang="en">
        <body>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
