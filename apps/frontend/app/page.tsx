"use client"

import { GalleryVerticalEnd } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-svh bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border border-border bg-card shadow-sm rounded-lg mx-auto mt-6 w-full max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight">InMa</span>
        </div>
        <nav className="flex gap-6 items-center text-sm font-medium">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how" className="hover:text-primary transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          <Link href="/login">
            <Button size="lg" className="px-6 ml-2">Login</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-4 py-16 relative w-full">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none -z-10" />
        <section className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 mt-12 mb-24">
          <div className="flex-1 flex flex-col items-start gap-6">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow mb-2">Invoice Management, Simplified</h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-2">
              InMa helps you manage your invoices, clients, and business with ease. Create, send, and track invoices in seconds. Stay organized and get paid faster.
            </p>
            <div className="flex gap-4">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-5 shadow-lg">Get Started</Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="text-lg px-8 py-5">Learn More</Button>
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            {/* Placeholder illustration */}
            <div className="w-[340px] h-[240px] bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-2xl font-bold border border-border shadow-inner">
              App Screenshot
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full max-w-6xl mx-auto grid gap-8 md:grid-cols-3 mb-24">
          <div className="bg-card rounded-lg p-8 shadow flex flex-col items-center border border-border">
            <span className="text-4xl mb-3">📄</span>
            <h2 className="font-bold text-xl mb-2">Easy Invoicing</h2>
            <p className="text-muted-foreground text-center">Create and send professional invoices in just a few clicks. Customize with your branding.</p>
          </div>
          <div className="bg-card rounded-lg p-8 shadow flex flex-col items-center border border-border">
            <span className="text-4xl mb-3">📊</span>
            <h2 className="font-bold text-xl mb-2">Business Insights</h2>
            <p className="text-muted-foreground text-center">Track payments, monitor revenue, and get insights into your business performance.</p>
          </div>
          <div className="bg-card rounded-lg p-8 shadow flex flex-col items-center border border-border">
            <span className="text-4xl mb-3">🔒</span>
            <h2 className="font-bold text-xl mb-2">Secure & Reliable</h2>
            <p className="text-muted-foreground text-center">Your data is safe with us. We use modern security practices to protect your business.</p>
          </div>
        </section>

        {/* How it works Section */}
        <section id="how" className="w-full max-w-4xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Create</h3>
              <p className="text-muted-foreground text-center">Sign up and set up your business profile in seconds.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">Send</h3>
              <p className="text-muted-foreground text-center">Generate invoices and send them to your clients instantly.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Get Paid</h3>
              <p className="text-muted-foreground text-center">Track payments and get notified when you’re paid.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full max-w-3xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-10">Pricing</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <div className="flex-1 bg-card border border-border rounded-lg p-8 shadow flex flex-col items-center">
              <h3 className="font-bold text-xl mb-2">Free</h3>
              <p className="text-muted-foreground mb-4">All core features, unlimited invoices & clients.</p>
              <div className="text-4xl font-extrabold mb-2">$0</div>
              <Button size="lg" className="w-full">Get Started</Button>
            </div>
            <div className="flex-1 bg-card border border-border rounded-lg p-8 shadow flex flex-col items-center opacity-60 cursor-not-allowed">
              <h3 className="font-bold text-xl mb-2">Pro <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">Coming soon</span></h3>
              <p className="text-muted-foreground mb-4">Advanced analytics, custom branding, and more.</p>
              <div className="text-4xl font-extrabold mb-2">$9<span className="text-lg font-normal">/mo</span></div>
              <Button size="lg" className="w-full" disabled>Contact Us</Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full max-w-3xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="grid gap-6">
            <div>
              <h3 className="font-semibold mb-1">Is InMa really free?</h3>
              <p className="text-muted-foreground">Yes! All core features are free. We plan to offer a Pro plan with advanced features soon.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Can I use InMa for multiple businesses?</h3>
              <p className="text-muted-foreground">Currently, each account is tied to one business. Multi-business support is on our roadmap.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">How do I get support?</h3>
              <p className="text-muted-foreground">You can contact us anytime at <a href="mailto:support@inma.app" className="underline">support@inma.app</a>.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Is my data secure?</h3>
              <p className="text-muted-foreground">Absolutely. We use modern security practices and never share your data with third parties.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground text-sm border-t bg-card/80 mt-12">
        &copy; {new Date().getFullYear()} InMa. All rights reserved.
      </footer>
    </div>
  );
}
