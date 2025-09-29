import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Car Rental</h1>
      <p>
        Go to <Link href="/cars">Cars</Link>
      </p>
    </div>
  );
}

