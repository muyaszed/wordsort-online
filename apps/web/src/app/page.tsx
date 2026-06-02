import { Button } from "@wordsort/ui/button";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Wordsort</h1>
      <Button>Start Game</Button>
    </main>
  );
}
