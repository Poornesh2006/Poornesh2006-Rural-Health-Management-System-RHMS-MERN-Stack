export function getBreadcrumbs(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Dashboard", to: "/" }];

  if (segments.length === 0) {
    return crumbs;
  }

  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    crumbs.push({
      label: segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      to: currentPath,
    });
  });

  return crumbs;
}
