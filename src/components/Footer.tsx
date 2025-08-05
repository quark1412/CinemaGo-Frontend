export default function Footer() {
  return (
    <footer className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-center">
          &copy; {new Date().getFullYear()} Cinemago. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
