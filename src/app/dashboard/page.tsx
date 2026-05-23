import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  const usersCount = await prisma.user.count();
  const reportsCount = await prisma.report.count();
  const activityCount = await prisma.activityLog.count();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">
          You are signed in as{" "}
          <span className="font-semibold">{session?.user.role}</span>.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {usersCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Reports</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {reportsCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Activity Logs</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {activityCount}
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Authentication check
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          If you can see this page, login is working and your dashboard route is
          protected.
        </p>
      </section>
    </div>
  );
}