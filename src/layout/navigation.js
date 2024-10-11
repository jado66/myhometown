export const pages = () => {
  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return [
    {
      title: "Management",
      id: "landing-pages",
      pages: [
        {
          title: "User Management",
          href: rootUrl + "/admin-dashboard/users",
          requiredRole: "admin",
        },
        {
          title: "City Management",
          href: rootUrl + "/admin-dashboard/cities",
          requiredRole: "city-admin",
        },
        {
          title: "Community Management",
          href: rootUrl + "/admin-dashboard/communities",
          requiredRole: "community-admin",
        },
      ],
    },
    {
      title: "Tools & Support",
      id: "supporting-pages",
      pages: [
        // {
        //   title: 'Email Communications',
        //   href:  rootUrl+'/tools/email',
        // },
        // {
        //   title: "Texting",
        //   href: rootUrl + "/admin-dashboard/tools/sms",
        // },
        // {
        //   title: "Contact Directory",
        //   href: rootUrl + "/admin-dashboard/tools/directory",
        // },
      ],
    },
    {
      title: "Your Profile",
      id: "auth-pages",
      pages: [
        {
          title: "Manage Profile",
          href: rootUrl + "/maintenance",
        },
        {
          title: "Settings",
          href: rootUrl + "/maintenance",
        },
      ],
    },
    {
      title: "Need Help",
      id: "debug",
      pages: [
        {
          title: "Bug Report",
          href: rootUrl + "/bug-report",
        },
        {
          title: "Request a Feature",
          href: rootUrl + "/feature-request",
        },
      ],
    },
  ];
};
