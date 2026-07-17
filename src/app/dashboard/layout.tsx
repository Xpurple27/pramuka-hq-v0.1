import DashboardShell from '@/components/dashboard/dashboard-shell'
import { getDashboardContext } from '@/lib/scouthub-context'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await getDashboardContext()
  return <DashboardShell fullName={context.fullName} email={context.email} gudep={context.gudep} activeGudep={context.activeGudep}>{children}</DashboardShell>
}
