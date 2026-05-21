import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />
      <main className="flex-1 md:ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}