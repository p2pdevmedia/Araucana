import { ManagedUsersPage } from "../users/managed-users-page";

type AdminSecretariesPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

export default async function AdminSecretariesPage({ searchParams }: AdminSecretariesPageProps) {
  const params = await searchParams;
  return <ManagedUsersPage role="SECRETARY" notice={params?.notice} />;
}
