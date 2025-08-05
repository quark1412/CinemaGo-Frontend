export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="admin-layout">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
