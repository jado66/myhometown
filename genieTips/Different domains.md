### GIVE BUTTER:

You


I'm using nextjs and I want to have two sites using the same codebase so it's easier to manage. One is myhometown and all of the myhometown pages including apis start with /mht. The other site is cities-strong and all of those pages start with /cs. I want to use a ENV variable BASE_ROUTE which will be either 'cs' or 'mht' and slice the routes and filter the other ones. How can I do this?

Genie

Sure, you can achieve this by filtering pages based on the BASE_ROUTE environment variable in next.config.js. Here's how you can do it.

Firstly, create a .env.local file at the root of your project and define your BASE_ROUTE:

Diff
Copy
Insert
New
BASE_ROUTE=mht
Next, in your next.config.js, use the exportPathMap function to filter the pages depending upon your environment variable.

Let's suppose you have following pages structure:

Diff
Copy
Insert
New
pages/
  - mht/
    - index.js
    - about.js
  - cities-strong/
    - index.js
    - contact.js
  - index.js
Here is an example of how you can do this:

Diff
Copy
Insert
New
const { parse } = require('url')
const { BASE_ROUTE } = process.env

module.exports = {
  exportPathMap: async function (defaultPathMap) {
  
    // Filter the pages depending on the BASE_ROUTE
    const pathMap = Object.entries(defaultPathMap)
      .filter(([pathname]) => pathname === '/' || pathname.startsWith(`/${BASE_ROUTE}`))
      .reduce(
        (obj, [pathname, pageConfig]) => ({
          ...obj,
          [pathname.replace(`/${BASE_ROUTE}`, '')]: pageConfig,
        }),
        {}
      )

    return pathMap;
  }
}
This will filter out all pages that not start with current BASE_ROUTE and also remove the BASE_ROUTE part from the URL.

Still, remember that Next.js routes are server routes, so you'll need to restart the server whenever you change the BASE_ROUTE. Also, the exportPathMap only works with next export, which implies that if you are using features like next/image or ISR, then it might not work as expected.