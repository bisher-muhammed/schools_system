# School Management System

A modern **Next.js 13** application for managing school information without traditional REST APIs, leveraging **server actions** for backend operations.

---

## Features

* Add a new school with:

  * Name, Address, City, State, Contact Number, Email
  * Upload school image (JPG, JPEG, PNG, max 2MB)
* Real-time validation using **React Hook Form** and **Yup**
* Drag-and-drop image upload with preview
* Success, error, and info alerts
* Filter and search schools by city, state, and name
* Responsive and mobile-friendly UI
* **Server Actions** handle database operations directly without separate API routes
* Robust backend logic with MySQL connection retry handling

---

## How It Works (Without APIs)

This project demonstrates performing backend operations directly using **Next.js server actions**:

1. **Server Action Functions:**

   * Defined in `app/actions/ScoolList.actions.js`.
   * Handle CRUD operations for schools (add, fetch, filter).
   * Include validation, database retry logic, and file handling.

2. **Form Submission:**

   * `AddSchoolPage` is a client component using **React Hook Form**.
   * On submit, it calls the server action `addSchool(formData)` directly.
   * No separate `/api` routes are required.

3. **Database Operations:**

   * MySQL connection is managed via `lib/db.js` using `mysql2`.
   * Queries are executed using a utility function with retry logic.
   * Images are saved in `public/schoolImages`.

4. **Validation:**

   * Input and file validation are performed using **Yup** before any DB operations.

5. **Alerts & Feedback:**

   * Real-time alerts (success, error, info) are shown using local state.
   * Image upload feedback and validation messages appear immediately.

---

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd app
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with DB credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=schools_db
DB_PORT=3306
```

4. Create `public/schoolImages` folder for storing uploaded images:

```bash
mkdir public/schoolImages
```

5. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

* `npm run dev` – Start development server
* `npm run build` – Build production version
* `npm run start` – Start production server
* `npm run lint` – Lint the project

---

## Tech Stack

* **Frontend:** React, Next.js 13, Tailwind CSS, React Hook Form, Lucide Icons
* **Backend:** Node.js, MySQL, Server Actions (Next.js App Router)
* **Validation:** Yup
* **File Uploads:** Handled server-side and stored in `public/schoolImages`

---

## Notes

* Max file size for images: 2MB
* Supported image formats: JPG, JPEG, PNG
* All backend operations are done **without APIs**, directly through server actions.

---

## License

MIT License © 2025
