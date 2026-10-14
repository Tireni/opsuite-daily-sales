# Daily Sales Log

Daily Sales Log helps a business keep track of what it sells each day. Enter an item and its price, and the app saves the sale, records the time, and adds the amount to today's total.

For example, a clothing brand can record a **Cotton T-shirt — Black / M** sold for **₦18,000**. The sale stays saved even after the page is refreshed or the browser is closed.

[Open the public app](https://opsuite-daily-sales.vercel.app). No private link or account is required.

## What the app does

- **Record sale page:** enter an item name and the amount received.
- **Numbers-only price field:** type whole naira amounts, such as `18000`. Letters, commas, decimal points, and other symbols are blocked, including in pasted text.
- **Automatic date and time:** the app records when a sale is saved, so staff do not have to enter the time themselves.
- **Success popup:** an animated checkmark confirms that the sale was saved. The form then has empty fields ready for the next item.
- **Dashboard page:** see your complete sales history, including each item's price, date, and time. Newest sales appear first, and today's total is shown separately above the table.
- **Five sales per page:** use Previous and Next to move through the list. Ten sales take up two pages.
- **One complete daily total:** the total includes all of today's sales, including those on other pages.
- **Saved records:** sales are stored in a real database rather than only in the browser.
- **Clear messages:** the app explains when it is loading, when there are no sales, or when something needs to be corrected or retried.
- **Phone and desktop layouts:** both pages adjust to fit smaller screens.

The dashboard checks for updates once a minute and when you return to the browser tab. You can also select **Refresh**. Each new day starts at midnight in Lagos. Today's total and transaction count start over, but older sales remain visible in the history table with their original dates. They are not added to today's total.

## Tools used

| Tool | Its job |
| --- | --- |
| React | Builds the pages, form, table, and popup. |
| TypeScript | Helps catch mistakes in the code before the app runs. |
| Vite | Runs the app during development and prepares it for publishing. |
| Supabase PostgreSQL | Stores sales and calculates today's total. |
| Vercel | Hosts the website and runs the server code that talks to the database. |
| GitHub | Stores the source code and its change history. |

## Run it on your computer

You need **Node.js 22.12 or newer** and npm, which comes with Node.js. Download or clone this repository, then open a terminal in the project folder.

1. Install the packages the app needs:

   ```sh
   npm ci
   ```

2. Copy the example settings file:

   ```sh
   cp .env.example .env
   ```

3. Fill in the two settings listed below in `.env`, and set up the database using the next section.

4. Start the app:

   ```sh
   npm run dev
   ```

5. Open `http://127.0.0.1:5173`.

### Required settings

These are called **environment variables**. They tell the server where the database is and how to access it.

| Setting | What to enter |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project's website address, such as `https://your-project.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase secret/service role key. Only the server should use this key. |

Keep the real `.env` file out of GitHub. It is already excluded by `.gitignore`. Do not put `VITE_` before secret setting names: Vite can include settings with that prefix in the browser's code.

## Set up the database

Create a dedicated Supabase project. In its SQL editor, run:

```text
supabase/migrations/202610130001_daily_sales.sql
supabase/migrations/202610140001_sales_history.sql
```

This file creates the sales table and the rules for saving and reading sales. It also adds an index, which helps the database find sales by time more quickly.

If you use the Supabase command-line tool and are signed in, you can run the same setup with:

```sh
supabase db query --linked --project-ref YOUR_PROJECT_REF --file supabase/migrations/202610130001_daily_sales.sql
supabase db query --linked --project-ref YOUR_PROJECT_REF --file supabase/migrations/202610140001_sales_history.sql
```

Replace `YOUR_PROJECT_REF` with your Supabase project reference. Copy the project's URL and secret/service role key into `.env`.

### Clothing-brand examples

The deployed database was manually filled with **10 example clothing sales**, including T-shirts, a polo shirt, jeans, chinos, shorts, and a hoodie. Each item has a colour and size, and the examples total **₦317,000**. They are demonstration sales, not real customer purchases.

The app does not create these examples when it opens. They were inserted once, with dates and times for the day the script ran. On a later day, they remain visible in the sales history, but do not count towards the new day's total.

The example script is `supabase/clothing-examples.sql`. **Running it deletes existing sales and replaces them with the 10 clothing examples.** Use it only when you deliberately want to reset the data.

## Public access and data

There are no user accounts, registration forms, login screens, or private access links. Anyone who can open the public site can view sales history and submit new sales. The API checks that sale submissions come from the app's own origin to reduce cross-site requests; this is not authentication and does not prevent a person or script from calling the public API directly.

The Supabase service-role key stays on the server, and Supabase does not grant anonymous users direct access to the sales table or database functions. The public server API uses that key to read and save sales. The hosted app uses HTTPS to protect requests while they travel over the internet.

## How the code is organised

| Location | What it contains |
| --- | --- |
| `src/App.tsx` | The app name, navigation, and choice of page. |
| `src/pages/` | The dashboard and record-sale pages. |
| `src/components/` | Smaller parts such as the price field, table, page controls, and success popup. |
| `src/hooks/` | The logic for loading sales, refreshing them, and showing errors. |
| `src/api/` | The browser's requests to the server. |
| `shared/` | Shared descriptions of what a sale and dashboard response contain. |
| `api/` and `server/` | Sale validation and communication with Supabase. |
| `supabase/` | Database setup and the optional example-data script. |
| `tests/` and `scripts/browser-test.ts` | Checks that the app works as expected. |

The code uses four object-oriented principles where they help:

- **Encapsulation:** `SaleDraft` protects its values. An item, amount, and submission ID must pass its checks before a sale draft can be created.
- **Abstraction:** `SalesRepository` describes simple tasks such as getting sales history and today's total, or saving a sale. The code using it does not need to know the database details.
- **Inheritance:** `SupabaseSalesRepository` extends that common storage contract and supplies the Supabase version of those tasks.
- **Polymorphism:** the request handler works with the common contract, so a different storage implementation can be supplied without rewriting the handler. Tests use this to check the handler separately from the real database.

React pages use components and hooks to share behaviour. The production app always uses Supabase for storage.

## Check that it works

Run the automated code checks and prepare a production build:

```sh
npm test
npm run build
```

With `.env` filled in and the local app running, run the browser checks:

```sh
npx playwright install chromium
npm run test:browser
```

These checks try recording a sale, entering invalid prices, moving between pages, refreshing the browser, and checking the total. They temporarily add test sales to the configured database and remove those records afterward.

To test the published app, set `TEST_BASE_URL` to its HTTPS address before running the browser checks.

This additional database check tests midnight boundaries, invalid records, and denied direct anonymous database access:

```sh
supabase db query --linked --project-ref YOUR_PROJECT_REF --file tests/database.sql
```

Its temporary records are rolled back, meaning the database undoes those test inserts when the check finishes.

## Publish with Vercel

1. Create a Vercel project for this repository, or use the existing one.
2. Add the two required settings to the project's **Production** environment variables.
3. If using the command-line tool, install it, sign in, and publish:

   ```sh
   npm install -g vercel
   vercel login
   vercel --prod
   ```

4. Open the deployed address. No access token or setup link is needed.

Connecting the repository through Vercel's GitHub integration lets future pushes publish automatically. The Vercel GitHub app must have permission to access the repository.

## Notes

### 1. What I built

I built a daily sales book that a business can use in a browser. Staff record an item and its price on one page, then check sales and the daily total on another. Sales are saved in a real database, and the app works on both phones and computers.

### 2. Why I made these choices

- **React instead of vanilla JavaScript:** I chose React because it is easy to use and gives me reusable building blocks called components. It handles updating the page when data changes, so I can focus on what the app should show instead of manually changing each part of the page with vanilla JavaScript. This is the abstraction React provides: it takes care of some of the details for me.
- **Supabase for the database:** I chose Supabase because it makes setting up and using a real database straightforward. It provides a hosted PostgreSQL database and tools for working with it, so I can save sales without having to set up and maintain a database server myself.
- **Two separate pages:** I wanted recording a sale and reviewing sales to each have a clear space. The entry page stays focused on filling in the form, while the dashboard stays focused on the business's sales.
- **Five sales per page:** I wanted the table to stay short and easy to read, especially on a phone. Previous and Next show the next group of five without making the page very long.
- **A numbers-only price field:** I wanted to prevent mistakes such as typing a letter or adding a comma to a price. Staff enter `18000` for ₦18,000. The table adds the currency sign and formatting when it displays the saved amount.
- **A success popup and empty form:** I wanted staff to know that a sale was saved. The animated checkmark confirms it, and clearing the fields makes it easier to enter the next sale without accidentally reusing the last item's details.
- **Automatic times and newest sales first:** I wanted staff to avoid typing dates and to find the sale they just recorded quickly. The database records the time, and the latest sale goes at the top of the list.
- **A total for the whole day:** I wanted the total to represent all of today's sales, even when the table has several pages. Every page shows the same complete daily total.
- **Saved records and careful counting:** I chose a real database so sales survive a refresh. Money is stored as whole kobo: for example, ₦100 is saved as 10,000 kobo. This helps avoid tiny rounding mistakes when amounts are added. Each submission also gets its own ID so retrying the same request does not save the same sale twice.
- **Lagos time and lasting history:** I wanted everyone to agree on when a business day begins and ends. The app uses midnight in Lagos, regardless of the device's time zone. Yesterday's sales stay visible with their dates, while the daily total counts only sales made today.
- **Public access without account setup:** I wanted the app to open directly without accounts or a private link. The app's server-side API keeps the database key out of the browser, while the public site can read and submit sales.
- **A clear name and a simple layout:** I wanted people to recognise Daily Sales Log immediately and find its two tasks easily. The app avoids extra menus, charts, and decoration that would distract from recording and reviewing sales.
- **Smaller code files:** I wanted the code to be easier to read and maintain. The form, table, popup, and database code each have their own place, so changing one part is easier to follow.

### 3. What I would improve with one more day

I would add rate limiting and an owner-managed review or correction process to reduce abuse now that sale submission is public. I would also improve how the app loads long sales lists: it currently gets the saved history together and displays five at a time; for a much busier business, I would load only the page being viewed while still keeping the complete daily total.
