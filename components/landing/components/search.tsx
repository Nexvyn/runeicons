"use client";
import Image from "next/image";

import {
  Bell,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  Heart,
  Home,
  Lock,
  Mail,
  Map,
  Menu,
  Package,
  Phone,
  Search as SearchIcon,
  Settings,
  Share2,
  Star,
  Trash2,
  Upload,
  User,
  X,
  Zap,
} from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import TabBackgroundAnimation from "../../ui/tab-background-animation";

const ICONS = [
  { Icon: SearchIcon, name: "Search" },
  { Icon: Heart, name: "Heart" },
  { Icon: Star, name: "Star" },
  { Icon: Settings, name: "Settings" },
  { Icon: Bell, name: "Bell" },
  { Icon: User, name: "User" },
  { Icon: Home, name: "Home" },
  { Icon: Package, name: "Package" },
  { Icon: Zap, name: "Zap" },
  { Icon: Lock, name: "Lock" },
  { Icon: Share2, name: "Share" },
  { Icon: Trash2, name: "Trash" },
  { Icon: Edit, name: "Edit" },
  { Icon: Eye, name: "Eye" },
  { Icon: Copy, name: "Copy" },
  { Icon: Check, name: "Check" },
  { Icon: X, name: "Close" },
  { Icon: Download, name: "Download" },
  { Icon: Upload, name: "Upload" },
  { Icon: Menu, name: "Menu" },
  { Icon: Calendar, name: "Calendar" },
  { Icon: Clock, name: "Clock" },
  { Icon: Mail, name: "Mail" },
  { Icon: Phone, name: "Phone" },
  { Icon: Map, name: "Map" },
];

const Search = () => {
  return (
    <div className="flex h-full flex-col gap-5 py-6 lg:flex-row">
      <div className="min-h-[400px] lg:min-h-0 lg:w-1/2">
        <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-2xl bg-background bg-center">
          <Image
            className="h-full w-full object-cover"
            src="https://i.pinimg.com/1200x/d3/49/0e/d3490eaa1637583dca52fe021fa38d19.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      <div className="lg:w-1/2">
        <div
          className="flex h-full w-full items-center justify-center rounded-2xl bg-center bg-no-repeat p-6 max-sm:p-2 md:p-10"
          style={{
            backgroundImage: "url('/landing/gradient/search-gradient2.png')",
            backgroundSize: "cover",
          }}
        >
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-border/50 bg-background/20 p-4 shadow-lg backdrop-blur-[2px]">
              <div className="flex h-11 items-center overflow-hidden rounded-xl border border-input bg-background/80 focus-within:ring-2 focus-within:ring-ring/50">
                <div className="flex h-full items-center px-3 text-muted-foreground dark:text-white/80">
                  <SearchIcon className="h-4 w-4" />
                </div>
                <Input
                  placeholder="Search for icons..."
                  className="h-full flex-1 border-0 bg-transparent pl-2 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 dark:text-white dark:placeholder:text-white/70"
                />
                <Button className="h-full rounded-none bg-white px-4 text-black hover:bg-white/90 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
                  Search
                </Button>
              </div>

              <div className="my-3 mt-4 grid grid-cols-3 justify-items-center gap-2 px-1 sm:my-4 sm:mt-6 sm:grid-cols-4 sm:gap-3 sm:px-0 md:grid-cols-5">
                {ICONS.map(({ Icon, name }, index) => (
                  <div
                    key={name}
                    className={`flex w-14 flex-col items-center gap-1 ${index >= 9 ? "hidden sm:flex" : ""}`}
                  >
                    <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-muted/50 transition-colors hover:bg-muted">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="w-full truncate text-center text-[10px] text-white/85">
                      {name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-border/40 pt-4">
                <TabBackgroundAnimation />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
