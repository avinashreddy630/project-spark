import { Header } from "@/components/layout/Header";

export default function Profile() {
  return (
    <div className="animate-fade-in">
      <Header title="Profile" />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="text-center">
          <span className="text-5xl">👤</span>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Profile</h2>
          <p className="mt-2 text-muted-foreground">Manage your account and settings</p>
        </div>
      </div>
    </div>
  );
}
