import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";

export function AccessPanel({ eyebrow, title, description, children, aside = null, tone = "red" }) {
  const palette = tone === "green"
    ? {
        frame: "border-[#00ff66]/35",
        eyebrow: "text-[#00ff66]/85",
        asideFrame: "border-[#00ff66]/18",
        asideBg: "bg-[linear-gradient(180deg,rgba(0,255,102,0.12),rgba(0,0,0,0.15))]",
      }
    : {
        frame: "border-[#ff0033]/35",
        eyebrow: "text-[#ff0033]/80",
        asideFrame: "border-white/10",
        asideBg: "bg-[linear-gradient(180deg,rgba(255,0,51,0.10),rgba(0,0,0,0.15))]",
      };

  return (
    <div className="mx-auto grid min-h-[72vh] w-full max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <Card glow={tone} className={`flex flex-col justify-center bg-black/70 px-6 py-8 md:px-10 ${palette.frame}`}>
        <CardHeader className="space-y-4">
          <div className={`font-vt323 text-lg tracking-[0.45em] ${palette.eyebrow}`}>{eyebrow}</div>
          <CardTitle className="text-3xl md:text-5xl">{title}</CardTitle>
          <CardDescription className="max-w-2xl font-vt323 text-2xl leading-relaxed text-white/68">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">{children}</CardContent>
      </Card>

      <Card glow="none" className={`flex min-h-[380px] flex-col justify-between p-6 ${palette.asideFrame} ${palette.asideBg}`}>
        {aside}
      </Card>
    </div>
  );
}
