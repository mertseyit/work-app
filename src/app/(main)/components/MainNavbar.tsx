'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

const MainNavbar = () => {
  const { user, isLoaded } = useUser();
  return (
    <>
      <div className="px-3 py-4 flex items-center justify-between border-b bg-accent fixed top-0 w-screen">
        <span className="text-2xl font-semibold">Work App</span>
        {isLoaded ? (
          <>
            {user ? (
              <div className="flex items-center justify-center gap-2">
                <Avatar className="rounded-full flex items-center justify-center">
                  {!isLoaded ? <Spinner /> : <AvatarImage src={user?.imageUrl} />}
                  <AvatarFallback>{user?.firstName}</AvatarFallback>
                </Avatar>
                <Button asChild>
                  <Link href={'/finance'}>Panele Git</Link>
                </Button>
              </div>
            ) : (
              <SignInButton forceRedirectUrl={'/finance'}>
                <Button variant={'outline'}>Giriş yap</Button>
              </SignInButton>
            )}
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </>
  );
};

export default MainNavbar;
