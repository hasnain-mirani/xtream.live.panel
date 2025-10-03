import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PlanCard({
  name, price, features = [], ctaText = "Choose", onClick
}: { name: string; price: string; features?: string[]; ctaText?: string; onClick?: () => void }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <div className="text-2xl font-bold">{price}</div>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-4 space-y-1 text-sm">
          {features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="rounded-2xl">{ctaText}</Button>
      </CardFooter>
    </Card>
  );
}
