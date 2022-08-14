import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";
import { NetworkList } from "./NetworkList";

export function Nav() {
  return (
    <NavigationMenu.Root className="w-screen">
      <NavigationMenu.List className="flex flex-row justify-between p-4 items-center">
        {/* logo */}
        <NavigationMenu.Item>
          <Logo className="w-16" />
        </NavigationMenu.Item>

        <div className="flex flex-row justify-between items-center">
          {/* network list */}
          <NetworkList className="mr-8" />

          {/* connect button */}
          <NavigationMenu.Item>
            <WalletButton />
          </NavigationMenu.Item>
        </div>
      </NavigationMenu.List>

      <NavigationMenu.Viewport />
    </NavigationMenu.Root>
  );
}
