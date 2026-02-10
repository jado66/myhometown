export const pages = () => {
  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return [
    {
      title: "Management",
      id: "landing-pages",
      requiredPermission: "administrator || content_development",
      pages: [
        {
          title: "User Management",
          href: "https://myhometown-landing.vercel.app/admin/users",
          requiredPermission: "administrator",
        },
        {
          title: "City Management",
          href: rootUrl + "/admin-dashboard/cities",
          requiredPermission: "content_development",
        },
        {
          title: "Community Management",
          href: rootUrl + "/admin-dashboard/communities",
          requiredPermission: "content_development",
        },
      ],
    },
    {
      title: "Missionaries & Volunteers",
      id: "missionary-volunteer-pages",
      pages: [
        {
          title: "Missionaries & Volunteer Roster",
          href: rootUrl + "/admin-dashboard/missionaries",
          requiredPermission: "missionary_volunteer_management",
        },
        {
          title: "Log Service Hours and View Directory",
          href: rootUrl + "/admin-dashboard/hours-and-directory",
        },
      ],
    },
    {
      title: "Texting",
      id: "texting-pages",
      requiredPermission: "texting",
      pages: [
        {
          title: "Contact Directory",
          href: rootUrl + "/admin-dashboard/texting/directory",
          requiredPermission: "texting",
        },
        {
          title: "Send Messages",
          href: rootUrl + "/admin-dashboard/texting/send",
          requiredPermission: "texting",
        },

        // {
        //   title: "Scheduled Messages",
        //   href: rootUrl + "/admin-dashboard/texting/scheduled-messages",
        //   requiredPermission: "texting",
        // },
        {
          title: "Texting Logs",
          href: rootUrl + "/admin-dashboard/texting/logs",
          requiredPermission: "texting",
        },
      ],
    },
    {
      title: "Tools",
      id: "supporting-pages",
      pages: [
        // {
        //   title: 'Email Communications',
        //   href:  rootUrl+'/tools/email',
        // },

        {
          title: "Classes and Rolls",
          href: rootUrl + "/admin-dashboard/classes",
        },
        {
          title: "Days Of Service",
          href: rootUrl + "/admin-dashboard/days-of-service",
        },
        // {
        //   title: "Volunteer Signups",
        //   href: rootUrl + "/admin-dashboard/volunteer-signups",
        // },
        // {
        //   title: "User Guide",
        //   href: rootUrl + "/admin-dashboard/tools/user-guide",
        // },
        // {
        //   title: "Video Tutorials",
        //   href: rootUrl + "/admin-dashboard/tools/video-tutorials",
        // },
      ],
    },
    {
      title: "Support",
      id: "support-pages",
      requiredPermission: "any",
      pages: [
        {
          title: "Bug Report",
          href: rootUrl + "/bug-report",
          requiredPermission: "any",
        },
        {
          title: "Request a Feature",
          href: rootUrl + "/feature-request",
          requiredPermission: "any",
        },
      ],
    },
    {
      title: "Development Tools",
      id: "landing-pages",
      requiredPermission: "administrator",
      pages: [
        {
          title: "Impersonate User",
          href: rootUrl + "/admin-dashboard/impersonate",
        },
        {
          title: "Development Board",
          href: rootUrl + "/admin-dashboard/tasks",
        },
        {
          title: "Bugs and Feature Requests",
          href: rootUrl + "/admin-dashboard/bugs-and-features",
        },
        {
          title: "Upload Media",
          href: rootUrl + "/admin-dashboard/tools/media-upload",
        },
      ],
    },
    // {
    //   title: "Upcoming Features",
    //   id: "auth-pages",
    //   pages: [
    //     {
    //       title: "Class Signup Creation",
    //       href: rootUrl + "/admin-dashboard/upcoming/create-class-signups",
    //     },
    //     {
    //       title: "Automatic Roll Creation",
    //       href: rootUrl + "/admin-dashboard/upcoming/automatic-roll-creation",
    //     },
    //   ],
    // },
  ];
};
