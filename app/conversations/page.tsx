import DashboardLayout from "@/components/DashboardLayout";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";

export default function ConversationsPage() {
  return (
    <DashboardLayout>
      <AwEmpty className="min-h-[60vh]">
        <AwEmptyHeader>
          <AwEmptyTitle>Em breve</AwEmptyTitle>
        </AwEmptyHeader>
      </AwEmpty>
    </DashboardLayout>
  );
}
