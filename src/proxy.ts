import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Herkese açık (Public) rotaları belirle
// Giriş, Kayıt ve Anasayfa (/) herkese açık olmalı.
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  // '/api/webhooks(.*)' // İleride Stripe vs bağlarsan webhookları da açman gerekebilir
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Eğer gidilen rota "Public" değilse, korumaya al (Login'e yönlendirir)
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js statik dosyaları hariç her şeyi yakala
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API rotalarını her zaman yakala
    '/(api|trpc)(.*)',
  ],
};
