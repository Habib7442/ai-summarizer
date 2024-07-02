const DashboardLayout = async ({ children }: any) => {
  return (
    <div className="h-full w-full p-4 bg-slate-950">
      <main className="flex flex-col">{children}</main>
    </div>
  );
};

export default DashboardLayout;
