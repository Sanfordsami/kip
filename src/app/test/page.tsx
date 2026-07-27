import { AssignmentForm } from "@/components/assignment-form";

export default function TestPage() {
  return (
    <main className="p-6">
      <AssignmentForm employees={[]} tasks={[]} currentManagerId="test" />
    </main>
  );
}
