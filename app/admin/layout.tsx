export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adminLayout w-full min-h-screen h-screen bg-bgPrimary flex justify-center items-center text-fontPrimary">
      {children}
    </div>
  );
}
