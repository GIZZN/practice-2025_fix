'use client';

import { TrackOrder } from '@/components/TrackOrder/TrackOrder';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';

export default function TrackingPage() {
  return (
    <>
      <Header />
      <TrackOrder />
      <Footer />
    </>
  );
} 