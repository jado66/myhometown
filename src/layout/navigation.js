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
        {
          title: "Texting",
          href: rootUrl + "/admin-dashboard/tools/sms",
        },
        {
          title: "Contact Directory",
          href: rootUrl + "/admin-dashboard/tools/directory",
        },
        {
          title: "User Guide",
          href: rootUrl + "/admin-dashboard/tools/user-guide",
        },
        {
          title: "Video Tutorials",
          href: rootUrl + "/admin-dashboard/tools/video-tutorials",
        },
      ],
    },
    {
      title: "Upcoming Features",
      id: "auth-pages",
      pages: [
        {
          title: "Class Signup Creation",
          href: rootUrl + "/admin-dashboard/upcoming/create-class-signups",
        },
        {
          title: "Automatic Role Creation",
          href: rootUrl + "/admin-dashboard/upcoming/automatic-role-creation",
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
