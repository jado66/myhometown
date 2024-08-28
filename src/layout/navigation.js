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
        //   title: 'SMS Communications',
        //   href:  rootUrl+'/tools/sms',
        // },
        // {
        //   title: 'Give Butter Campaigns',
        //   href: '/maintenance',
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
          href: "/dev/user-testing",
        },
        {
          title: "Request a Feature",
          href: "/dev/user-testing",
        },
      ],
    },
  ];
};
