export default function Footer() {
  return (
    <footer className="border-t px-6 py-3">
      <div className="flex flex-col items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} SharkFin
        </p>

        <p>
          Smart Personal Finance Assistant
        </p>
      </div>
    </footer>
  );
}