"use server";

import { getPool } from "@/lib/db";
import * as yup from "yup";
import fs from "fs";
import path from "path";

// Validation schema
const schoolSchema = yup.object({
  name: yup
    .string()
    .matches(/^[a-zA-Z0-9\s]+$/, "Name must be alphanumeric")
    .required("Name is required"),
  address: yup.string().required("Address is required"),
  city: yup
    .string()
    .matches(/^[a-zA-Z\s]+$/, "City must contain only alphabets")
    .required("City is required"),
  state: yup.string().required("State is required"),
  contact: yup
    .string()
    .matches(/^[0-9]{10}$/, "Contact must be a 10-digit number")
    .required("Contact is required"),
  email_id: yup.string().email("Invalid email format").required("Email is required"),
  image: yup
    .mixed()
    .required("Image is required")
    .test("fileSize", "File size too large (max 2MB)", (file) => file && file.size <= 2 * 1024 * 1024)
    .test("fileType", "Unsupported file format", (file) =>
      file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    ),
});

// DB query helper with retry
async function executeQuery(query, params = [], retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const pool = getPool();
      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      lastError = error;
      if ((error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') && attempt < retries) {
        await new Promise(res => setTimeout(res, attempt * 1000));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// Add new school
export async function addSchool(formData) {
  try {
    // Convert FormData -> plain object for validation
    const plainData = {};
    formData.forEach((val, key) => {
      if (key !== "image") plainData[key] = val;
    });
    plainData.image = formData.get("image");

    const validData = await schoolSchema.validate(plainData, { abortEarly: false });

    // Check duplicate
    const [existingSchools] = await executeQuery(
      "SELECT id FROM schools WHERE name = ? AND city = ?",
      [validData.name, validData.city]
    );
    if (existingSchools.length > 0) {
      return { success: false, errors: ["A school with this name already exists in this city"] };
    }

    // Save image
    const uploadDir = path.join(process.cwd(), "public", "schoolImages");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const imageFile = validData.image;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const fileExt = path.extname(imageFile.name);
    const sanitizedName = validData.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${Date.now()}_${sanitizedName}${fileExt}`;
    const uploadPath = path.join(uploadDir, filename);

    fs.writeFileSync(uploadPath, buffer);

    try {
      const [result] = await executeQuery(
        "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [validData.name, validData.address, validData.city, validData.state, validData.contact, filename, validData.email_id]
      );
      return { success: true, id: result.insertId };
    } catch (dbError) {
      if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
      throw dbError;
    }
  } catch (error) {
    console.error("Error adding school:", error);
    if (error.name === "ValidationError") return { success: false, errors: error.errors };
    return { success: false, errors: [error.message || "Failed to add school"] };
  }
}

// Get states
export async function getStates() {
  try {
    const [rows] = await executeQuery("SELECT DISTINCT state FROM schools WHERE state IS NOT NULL AND state != '' ORDER BY state");
    return rows.map(r => r.state);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get cities
export async function getCities() {
  try {
    const [rows] = await executeQuery("SELECT DISTINCT city FROM schools WHERE city IS NOT NULL AND city != '' ORDER BY city");
    return rows.map(r => r.city);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get schools
export async function getSchools(filters = {}) {
  try {
    let sql = "SELECT * FROM schools WHERE 1=1";
    const params = [];

    if (filters.state?.trim()) { sql += " AND state = ?"; params.push(filters.state.trim()); }
    if (filters.city?.trim()) { sql += " AND city = ?"; params.push(filters.city.trim()); }
    if (filters.search?.trim()) {
      const s = `%${filters.search.trim()}%`;
      sql += " AND (name LIKE ? OR city LIKE ? OR state LIKE ? OR address LIKE ?)";
      params.push(s, s, s, s);
    }

    sql += " ORDER BY id DESC";
    const [rows] = await executeQuery(sql, params);
    return rows;
  } catch (error) {
    console.error(error);
    return [];
  }
}

