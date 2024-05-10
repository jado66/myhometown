import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function GET(req, { params }) {

    // Extract the city and state from query parameters
    const { cityQuery, stateQuery } = params

    // Prepare the query using city and state:
    let query = {
        name: cityQuery.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        state: stateQuery.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    };

     // Connect to mongodb and fetch cities
    let db, cities;
    try {
        ({ db } = await connectToMongoDatabase());
        cities = db.collection('Cities');
    } catch(e){
        console.error('Error occurred while connecting to MongoDB', e);
        return new Response(JSON.stringify({ error: 'Error occurred while connecting to MongoDB' }), { status: 500 });
    }

    console.log(`Looking for ${cityQuery}, ${stateQuery} with `+JSON.stringify(query));

    let results;
    try {
        results = await cities.find(query).toArray();
    }
    catch(e){
        console.error('Error occurred while fetching cities', e);
        return new Response(JSON.stringify({ error: 'Error occurred while fetching cities' }), { status: 500 });
    }   

    if(results.length === 0) {
        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
    } else if (!results[0].visibility) {
        return new Response(JSON.stringify({ error: 'The requested data is private' }), {status: 403});
    }

    return new Response(JSON.stringify(results),{status: 200});
}

export async function PUT(req, { params }) {

    // Extract the cityName and newState from query parameters
    const { cityQuery, stateQuery } = params

    // Prepare the update using city name and new state:
    let query = {
        name: cityQuery.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        state: stateQuery.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    };


    const { city } = await req.json();

    // Connect to mongodb and fetch cities
    let db, cities;
    try {
        ({ db } = await connectToMongoDatabase());
        cities = db.collection('Cities');
    } catch(e){
        console.error('Error occurred while connecting to MongoDB', e);
        return new Response(JSON.stringify({ error: 'Error occurred while connecting to MongoDB' }), { status: 500 });
    }
  
    const { _id, ...cityWithoutId } = city;

    let modifiedCount;
    try {
       
        const result = await cities.updateOne(query, { $set: cityWithoutId });

        modifiedCount = result.modifiedCount;
    }
    catch(e){
        console.error('Error occurred while updating city', e);
        return new Response(JSON.stringify({ error: 'Error occurred while updating city' }), { status: 500 });
    }   
    return new Response(JSON.stringify({ modifiedCount }),{status: 200});
}