import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CreatorProgramPromo() {
  return (
    <Card className="bg-secondary">
      <CardContent className="p-4 space-y-3">
        <h2 className="text-xl font-bold">Become a BHOLO Creator</h2>
        <p className="text-sm text-muted-foreground">
            From fan to football content king. Create content, build your community, and earn cash.
        </p>
        <Button size="sm" className="rounded-full font-bold px-4">
          Join Now
        </Button>
      </CardContent>
    </Card>
  );
}
