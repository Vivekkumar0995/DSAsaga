import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    bytes: number;
    width?: number;
    height?: number;
    format?: string;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
    try {
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json(
                { error: "Cloudinary configuration is missing" },
                { status: 500 },
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "Only image files are allowed" },
                { status: 400 },
            );
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            return NextResponse.json(
                { error: "Image size must be 5MB or smaller" },
                { status: 400 },
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image",
                        folder: "DsasagaImageUpload",
                        transformation: [{ quality: "auto", fetch_format: "auto" }],
                    },
                    (error, uploadResult) => {
                        if (error || !uploadResult) {
                            reject(error ?? new Error("Cloudinary upload failed"));
                            return;
                        }
                        resolve(uploadResult as CloudinaryUploadResult);
                    },
                );

                uploadStream.end(buffer);
            },
        );

        return NextResponse.json(
            {
                publicId: result.public_id,
                url: result.secure_url,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                format: result.format,
            },
            { status: 200 },
        );
    } catch (error) {
        console.log("Error uploading image:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 },
        );
    }
}
