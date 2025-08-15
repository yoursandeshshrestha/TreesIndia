import {
  sidebarItems,
  type SidebarItem,
} from "@/commons/components/Layout/Sidebar/sidebarItems";

interface Breadcrumb {
  label: string;
  href?: string;
}

export const generateBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const breadcrumbs: Breadcrumb[] = [];

  // Only add Dashboard if we're on the dashboard
  if (pathname === "/dashboard") {
    breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });
    return breadcrumbs;
  }

  // Split the pathname into segments and remove empty strings
  const segments = pathname.split("/").filter(Boolean);

  // Find the matching sidebar item
  const findItem = (
    items: SidebarItem[],
    path: string
  ): { parent: SidebarItem; child?: SidebarItem } | undefined => {
    for (const item of items) {
      // Check if this item's path matches
      if (item.path === path) {
        return { parent: item };
      }
      // Check if this is a dynamic route match (e.g., /organizations/:slug)
      if (item.path && path.startsWith(item.path.split(":")[0])) {
        return { parent: item };
      }
      // Check if any child's path matches
      if (item.children) {
        const child = item.children.find((child) => child.path === path);
        if (child) {
          return { parent: item, child };
        }
      }
    }
    return undefined;
  };

  // Handle nested routes
  if (segments.length > 0) {
    const fullPath = `/${segments.join("/")}`;
    const result = findItem(sidebarItems, fullPath);

    if (result) {
      const { parent, child } = result;

      // If it's a grouped item, add the group first
      if (parent.isGroup && child) {
        breadcrumbs.push({
          label: parent.label,
          href: undefined, // Group headers don't have direct links
        });
        breadcrumbs.push({
          label: child.label,
          href: child.path,
        });
      } else {
        // For non-grouped items or direct matches
        breadcrumbs.push({
          label: parent.label,
          href: parent.path || `/${segments[0]}`,
        });
      }

      // Special handling for organization detail page
      if (segments[0] === "organizations" && segments.length > 1) {
        // Get organization name from URL or state
        const orgName = segments[1]; // This will be the slug
        breadcrumbs.push({
          label: orgName.charAt(0).toUpperCase() + orgName.slice(1),
          href: fullPath,
        });
      } else if (segments.length > 1 && !parent.isGroup) {
        // For other nested routes (but not for grouped items)
        const lastSegment = segments[segments.length - 1];
        breadcrumbs.push({
          label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
          href: fullPath,
        });
      }
    }
  }

  return breadcrumbs;
};
