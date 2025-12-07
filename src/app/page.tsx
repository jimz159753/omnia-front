import { HomeIcon } from "@/components/HouseIcon";
import { DoubleCheckIcon } from "@/components/double-check-icon";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-foreground">Animated Icons</h1>

        <div className="flex flex-col items-center gap-6">
          {/* Home Icon */}
          <div className="flex flex-col items-center gap-2">
            <HomeIcon className="text-foreground" size={48} />
            <p className="text-sm text-muted-foreground">
              Home - Hover to animate
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <DoubleCheckIcon className="text-foreground" size={48} />
            <p className="text-sm text-muted-foreground">
              Double Check - Hover to animate
            </p>
          </div>

          {/* Different sizes and colors */}
          <div className="flex items-center gap-6">
            <HomeIcon className="text-blue-500" size={32} />
            <DoubleCheckIcon className="text-blue-500" size={32} />
            <HomeIcon className="text-green-500" size={40} />
            <DoubleCheckIcon className="text-green-500" size={40} />
            <HomeIcon className="text-purple-500" size={56} />
            <DoubleCheckIcon className="text-purple-500" size={56} />
          </div>
        </div>
      </div>
    </div>
  );
}
