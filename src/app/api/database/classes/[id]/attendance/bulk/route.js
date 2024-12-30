// src/app/api/database/classes/[id]/attendance/bulk/route.js

import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function POST(req, { params }) {
  const { id } = params;
  const { records } = await req.json();

  let db;
  try {
    ({ db } = await connectToMongoDatabase());
    const classes = db.collection("Classes");

    // Use bulkWrite to handle all attendance records in one operation
    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: { id },
        update: {
          $pull: {
            attendance: {
              studentId: record.studentId,
              date: record.date,
            },
          },
        },
      },
    }));

    // First remove any existing attendance records
    await classes.bulkWrite(bulkOps);

    // Then insert the new records
    const insertOp = {
      updateOne: {
        filter: { id },
        update: {
          $push: {
            attendance: {
              $each: records,
            },
          },
        },
      },
    };

    // Execute both operations
    await classes.bulkWrite(bulkOps);
    const result = await classes.bulkWrite([insertOp]);

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
    });
  } catch (e) {
    console.error("Error occurred while updating attendance", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while updating attendance" }),
      { status: 500 }
    );
  }
}

// src/app/api/database/classes/[id]/attendance/range/route.js
export async function GET(req, { params }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let db;
  try {
    ({ db } = await connectToMongoDatabase());
    const classes = db.collection("Classes");

    const result = await classes.findOne(
      {
        id,
        "attendance.date": {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        projection: {
          attendance: {
            $filter: {
              input: "$attendance",
              as: "attend",
              cond: {
                $and: [
                  { $gte: ["$$attend.date", startDate] },
                  { $lte: ["$$attend.date", endDate] },
                ],
              },
            },
          },
        },
      }
    );

    if (!result) {
      return new Response(JSON.stringify([]), {
        status: 200,
      });
    }

    return new Response(JSON.stringify(result.attendance || []), {
      status: 200,
    });
  } catch (e) {
    console.error("Error occurred while fetching attendance", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching attendance" }),
      { status: 500 }
    );
  }
}
