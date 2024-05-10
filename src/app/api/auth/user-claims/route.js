import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextResponse } from "next/server";

const GET = withApiAuthRequired(async function GET(req, res) {

  const options = {
    refresh: true,
  };

  const { accessToken, claims } = await getAccessToken(req, res, options);
// Return all claims for the user
const roles = claims['https://myhometown.vercel.app/roles'];
// Return the tokens
return NextResponse.json({roles: roles}, { status: 200 });
});


export { GET };