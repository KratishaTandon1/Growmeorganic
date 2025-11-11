Growmeorganic - React Internship Assignment: Persistent Data Table

This project implements a single-page data application using React, TypeScript, and PrimeReact to display artwork data from the Art Institute of Chicago API. It fulfills all technical requirements, focusing specifically on server-side pagination and persistent row selection without prefetching data.

🛠️ Tech Stack

Framework: React (Vite setup)

Language: TypeScript

UI Library: PrimeReact (DataTable, Button, OverlayPanel)

Styling: Tailwind CSS (for layout and custom components)

API: Art Institute of Chicago API (https://api.artic.edu/api/v1/artworks)

🚀 Setup and Run Instructions

Clone or Download: Place the project files into your desired directory.

Install Dependencies: Navigate to the project root and install all required packages:

npm install


Run Development Server: Start the application using Vite:

npm run dev


Access App: The application will be available in your browser at the local URL provided by Vite (e.g., http://localhost:5173/).

✅ Core Implementation Strategy: Persistent Selection

The core challenge of this assignment was implementing persistent row selection while strictly adhering to the anti-prefetching rule (i.e., you cannot fetch data from other pages to determine selection status).

1. The ID Set Strategy (Persistence)

Instead of storing selected row objects, the application uses a single global state set to track selections:

State: selectedRowIds: Set<number>

How it Works:

When a user selects or deselects a row, the row's unique id is added to or removed from the selectedRowIds Set.

The currentSelection is a memoized value that filters the artworks (the data currently loaded on the screen) against the global selectedRowIds Set.

When the user navigates pages (and new artwork data is loaded), the selectedRowIds Set remains unchanged. The new page's data is simply checked against the persistent ID Set, ensuring correct selection state is displayed upon return to previous pages.

2. Anti-Prefetching Compliance (Custom Selection)

The assignment strictly forbids fetching data from other pages for bulk selection. The handleCustomRowSelection function is implemented to comply with this check:

The function only operates on the artworks array, which contains only the data currently loaded by the API for the visible page.

It uses artworks.slice(0, count) to determine which rows (on the current page) should be toggled, preventing any logic that would iterate through or fetch subsequent pages, thus preserving application performance and memory.

3. Server-Side Pagination

The component handles pagination in a "lazy" loading mode:

The onPage event from the PrimeReact DataTable is used to calculate the required API page number (currentPage = Math.floor(first / rows) + 1).

The fetchData function is triggered only when the page number changes, ensuring data is always fetched from the server page by page.
