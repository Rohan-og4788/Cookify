export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted sm:px-6 lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} Recipe Finder. Built with Next.js,
          Prisma, and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
