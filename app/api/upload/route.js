import { writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const name = Date.now() + "_" + file.name;
  const filePath = path.join(process.cwd(), "public/uploads", name);

  await writeFile(filePath, buffer);

  return Response.json({ url: `/uploads/${name}` });
}