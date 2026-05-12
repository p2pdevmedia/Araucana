import { ManagedUsersPage } from "../users/managed-users-page";

type AdminDriversPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

export default async function AdminDriversPage({ searchParams }: AdminDriversPageProps) {
  const params = await searchParams;
  return <ManagedUsersPage role="DRIVER" notice={params?.notice} />;
}
