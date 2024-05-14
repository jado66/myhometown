import { connectToS3Bucket } from "@/util/db/s3";

export async function POST(req, res) {
  
    const { fileName, file } = await req.body; // should receive fileName and file from the body
  
    const s3 = connectToS3Bucket();

    if (!s3) {
      console.error('Error occurred while connecting to S3');
      return new Response(JSON.stringify({ error: 'Error occurred while connecting to S3' }), { status: 500 });
    }

    // Configure the file to upload to S3:
    let data = {
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: file,
          ACL: 'public-read' // to make file publicly readable
        };
  
    // Upload file to S3 bucket
    try {
      
      s3.upload(data, function(err, data){
         if(err) {
             console.log('error in callback');
             console.log(err);
             return new Response(JSON.stringify({ error: 'Error occurred while uploading file' }), { status: 500 });
         }
         console.log('success');
         console.log(data.Location);
         return new Response(JSON.stringify({ success: true, url: data.Location }),{ status: 200 })
      });
  
    } catch(e){
      console.error('Error occurred while uploading file', e);
      return new Response(JSON.stringify({ error: 'Error occurred while uploading file' }), { status: 500 });
    }
  
  }