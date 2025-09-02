import {
  ChevronsUpDown,
  UserCircle2,
  UserLock,
  CircleHelp,
  LogOut,
  ChevronRightIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./sidebar";
import { useNavigate } from "react-router-dom";
import HelpMenu from "./help-menu";
import { useRef, useState } from "react";
import { useAppContext } from "../../../resources/global/AppContaxt";
import { logoutUser } from "../../../resources/global/auth/logout";
import { useFrappeAuth } from "../../../resources/global/auth/frappeAuthContext";
import React from "react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const { API_URL, API_METHOD } = useAppContext();
  const { setUser } = useFrappeAuth();
  const navigate = useNavigate();

  // // Parse user from localStorage with fallback
  // const LoggedInUser = (() => {
  //   try {
  //     return JSON.parse(localStorage.getItem("user") || "{}");
  //   } catch {
  //     return {};
  //   }
  // })();

  const username = localStorage.getItem("name") || "User";
  const email = localStorage.getItem("email") || "user@example.com";
  const avatarChar =
    typeof username === "string" && username.length > 0
      ? username.charAt(0).toUpperCase()
      : "U";

  const helpTimeout = useRef<NodeJS.Timeout | null>(null);

  // F I X: LOGOUT should navigate after logout
  const handleLogout = async () => {
    try {
      await logoutUser(API_URL, API_METHOD, setUser);
      // setUser(null); // Not needed, already called inside logoutUser
      navigate("/login"); // or "/"
    } catch (err) {
      // Show feedback to user if desired
      alert(
        (err as Error)?.message || "Logout failed, please refresh and try again"
      );
    }
  };

  return (
    <SidebarMenu className="relative">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild  className="cursor-pointer">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground z-100"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={username} />
                <AvatarFallback className="rounded-lg uppercase font-bold">
                  {avatarChar}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{username}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg bg-background text-foreground"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg uppercase font-bold">
                    {avatarChar}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{username}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircle2 />
                Your account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserLock />
                Change password
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup
              onMouseEnter={() => {
                if (helpTimeout.current) clearTimeout(helpTimeout.current);
                setShowHelpMenu(true);
              }}
              onMouseLeave={() => {
                helpTimeout.current = setTimeout(() => {
                  setShowHelpMenu(false);
                }, 150);
              }}
            >
              <button
                type="button"
                onClick={() => setShowHelpMenu(true)}
                className="text-foreground/70 hover:bg-primary/10 hover:text-primary flex items-center w-full text-sm px-2 py-2 text-left rounded-sm cursor-pointer"
              >
                <CircleHelp className="w-4 mr-2 text-foreground/70" />
                Help
                <ChevronRightIcon className="block ml-auto" />
              </button>

              {showHelpMenu && (
                <div
                  onMouseEnter={() => {
                    if (helpTimeout.current)
                      clearTimeout(helpTimeout.current);
                    setShowHelpMenu(true);
                  }}
                  onMouseLeave={() => {
                    helpTimeout.current = setTimeout(() => {
                      setShowHelpMenu(false);
                    }, 150);
                  }}
                  className="absolute bottom-0 z-50 left-0 sm:left-full"
                >
                  <HelpMenu onClose={() => setShowHelpMenu(false)} />
                </div>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-delete" onClick={handleLogout}>
              <LogOut className="text-delete" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
