export const pages = [
    {
      title: 'Management',
      id: 'landing-pages',
      pages: [
        {
          title: 'User Management',
          href: '/admin-dashboard/users',
          requiredRole: 'admin'
        },
        {
          title: 'City Management',
          href: '/admin-dashboard/cities',
          requiredRole: 'city-owner'
        },
        {
          title: 'Community Management',
          href: '/admin-dashboard/communities',
          requiredRole: 'community-owner'
        },
      ]
    },
    {
      title: 'Tools & Support',
      id: 'supporting-pages',
      pages: [
        {
          title: 'Email Communications',
          href: '/maintenance',
        },
        {
          title: 'SMS Communications',
          href: '/maintenance',
        },
        // {
        //   title: 'Give Butter Campaigns',
        //   href: '/maintenance',
        // },
      ],
    },
    {
      title: 'Your Profile',
      id: 'auth-pages',
      pages: [
        {
          title: 'Manage Profile',
          href: '/maintenance',
        },
        {
          title: 'Settings',
          href: '/maintenance',
        },
      ],
    },
    {
      title: 'Developer Tools',
      id: 'debug',
      pages: [
        {
          title: 'User Testing',
          href: '/dev/user-testing',
        }
      ],
    },
  ];
  