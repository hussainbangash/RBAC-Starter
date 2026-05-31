import { prisma } from "@/lib/prisma";
import { appRoles } from "@/lib/permissions/access";
import { requireRole, roleLabels } from "@/lib/permissions/roles";
import { createUser, deleteUser, updateUserRole } from "./actions";

export default async function UsersPage() {
  const currentUser = await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-slate-500">
          Admin only
        </p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          User Management
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Add users, assign roles, and keep access control managed from one
          protected route.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Add user</h3>
          <p className="mt-1 text-sm text-slate-500">
            New users can sign in immediately with the password you set here.
          </p>
        </div>

        <form
          action={createUser}
          className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_180px_auto]"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              required
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue="USER"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-900"
            >
              {appRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Add
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {user.name ?? "Unnamed user"}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <form action={updateUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      disabled={user.id === currentUser.id}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      {appRoles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={user.id === currentUser.id}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {user.createdAt.toLocaleDateString("en-US")}
                </td>
                <td className="px-6 py-4">
                  <form action={deleteUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      disabled={user.id === currentUser.id}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
