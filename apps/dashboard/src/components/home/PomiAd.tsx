import { Card } from "@/components/ui";

type PomiAdProps = {
  text: string;
  /** 라벨 기본값: "POMI WELLNESS" */
  label?: string;
};

/** HELIOS 시민 통제 프로파간다 광고 컴포넌트 */
export function PomiAd({ text, label = "POMI WELLNESS" }: PomiAdProps) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <p className="hud-label mb-1">{label}</p>
      <p className="text-sm text-text-secondary">{text}</p>
    </Card>
  );
}
