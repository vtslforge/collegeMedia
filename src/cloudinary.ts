export const uploadToCloudinary = async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "college-media");
  form.append("public_id", `${Date.now()}-${file.name}`);

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dvwriqdzm/image/upload",
    {
      method: "POST",
      body: form
    }
  );

  const data = await res.json();
  return data.secure_url;
};
