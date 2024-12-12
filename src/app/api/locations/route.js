// app/api/locations/route.js

import connectToDatabase from '../../../lib/mongodb';
import Location from '../../../models/Location';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    console.log('Query:', query); // Log the query

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectToDatabase();

    const locations = await Location.find({
      $or: [
        { ZIP: query },
        { STORE_NAME: new RegExp(query, 'i') },
        { CITY: new RegExp(query, 'i') },
        { DOCTOR_NAME: new RegExp(query, 'i') },
      ],
    }).limit(10);

    console.log('Locations found:', locations); // Log the result

    return new Response(JSON.stringify(locations), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
