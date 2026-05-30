import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";

export default function ConversationsPage() {
  return (
    <AwDashboardLayout>
      <AwEmpty className="min-h-[60vh]">
        <AwEmptyHeader>
          <AwEmptyTitle>Em breve</AwEmptyTitle>
        </AwEmptyHeader>
      </AwEmpty>
    </AwDashboardLayout>
  );
}
