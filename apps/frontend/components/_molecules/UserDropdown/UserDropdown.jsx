'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';

export default function UserDropdown() {
  return (
    <SignedIn>
      <UserButton />
    </SignedIn>
  );
}
