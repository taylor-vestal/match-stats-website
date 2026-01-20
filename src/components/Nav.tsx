import { NavigationMenu } from "@kobalte/core/navigation-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/players", label: "Players" },
  { href: "/matches", label: "Matches" },
  { href: "/lb", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
];

const linkStyles = cn(
  "block px-3 py-2 text-sm font-medium rounded-md",
  "text-muted-foreground hover:text-foreground",
  "hover:bg-accent transition-colors"
);

export function Nav() {
  return (
    <NavigationMenu class="sticky left-0 w-screen flex justify-center">
      <NavigationMenu.Menu>
        {navItems.map((item) => (
          <NavigationMenu.Item>
            <NavigationMenu.ItemLabel
              as="a"
              href={item.href}
              class={linkStyles}
            >
              {item.label}
            </NavigationMenu.ItemLabel>
          </NavigationMenu.Item>
        ))}
        {import.meta.env.DEV && (
          <NavigationMenu.Item>
            <NavigationMenu.ItemLabel
              as="a"
              href="/test"
              class={cn(linkStyles, "text-red-500 hover:text-red-400")}
            >
              Test (dev-only)
            </NavigationMenu.ItemLabel>
          </NavigationMenu.Item>
        )}
      </NavigationMenu.Menu>
    </NavigationMenu>
  );
}
