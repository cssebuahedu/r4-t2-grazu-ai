import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/grazu/app-shell";
import { ComplianceProvider } from "@/lib/compliance";
import { DemoRoleProvider } from "@/lib/demo-roles";
export const Route = createFileRoute("/app")({ component: () => <DemoRoleProvider><ComplianceProvider><AppShell /></ComplianceProvider></DemoRoleProvider> });
