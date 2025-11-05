# shortleaf


A feature-rich URL shortener built with Node.js, Express, and SQLite. Create short, memorable links with custom IDs, expiration dates, and detailed analytics.

## Features

-  **URL Validation** - Validates URLs using Zod before shortening
-  **Collision Handling** - Prevents duplicate short IDs with retry logic
-  **SQLite Persistence** - Persistent storage with better-sqlite3
-  **Custom Short IDs** - Create vanity URLs (e.g., `yoursite.com/github`)
-  **Click Analytics** - Track clicks with user agent and referrer data
-  **Expiration Dates** - Set time-based or click-based expiration limits

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Validation**: Zod
- **ID Generation**: nanoid
- **Other**: CORS

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/rivieraviews/shortleaf.git
cd shortleaf
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
node server.js
```

The server will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

## API Documentation

### 1. Shorten URL

Create a new short URL with optional customization.

**Endpoint:** `POST /shorten`

**Request Body:**

```json
{
  "originalUrl": "https://example.com",
  "customId": "my-link",           // Optional: custom short ID (3-20 chars)
  "expiresInDays": 7,              // Optional: expire after N days (max 365)
  "maxClicks": 100                 // Optional: expire after N clicks
}
```

**Response (200):**

```json
{
  "shortUrl": "http://localhost:3000/my-link",
  "shortId": "my-link",
  "expiresAt": 1234567890000,      // Only if expiresInDays set
  "maxClicks": 100                 // Only if maxClicks set
}
```

**Error Responses:**
- `400` - Invalid URL format or validation error
- `409` - Custom ID already in use
- `500` - Unable to generate unique ID

### 2. Redirect to Original URL

Visit a short URL to be redirected to the original URL. Automatically tracks the click.

**Endpoint:** `GET /:shortId`

**Response:**
- `302` - Redirect to original URL
- `404` - Short URL not found
- `410` - URL has expired (time or click limit reached)

**Example:**
```
GET http://localhost:3000/my-link
→ Redirects to https://example.com
```

### 3. Get Analytics

Retrieve statistics for a short URL.

**Endpoint:** `GET /stats/:shortId`

**Response (200):**

```json
{
  "shortId": "my-link",
  "originalUrl": "https://example.com",
  "createdAt": 1234567890000,
  "clickCount": 42,
  "expiresAt": 1234567890000,      // null if no expiration
  "maxClicks": 100,                // null if no limit
  "isExpired": false
}
```

**Error Response:**
- `404` - Short URL not found

## Usage Examples

### Basic URL Shortening
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://github.com"}'
```

### Custom Short ID
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl":"https://github.com",
    "customId":"github"
  }'
```

### URL with Expiration
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl":"https://example.com",
    "expiresInDays":7,
    "maxClicks":100
  }'
```

### Check Analytics
```bash
curl http://localhost:3000/stats/github
```

### Use Short URL
```bash
curl http://localhost:3000/github
# Redirects to https://github.com
```

## Database Schema

### `urls` Table
| Column | Type | Description |
|--------|------|-------------|
| short_id | TEXT | Primary key, the short URL identifier |
| original_url | TEXT | The original long URL |
| created_at | INTEGER | Unix timestamp (ms) when created |
| click_count | INTEGER | Total number of clicks |
| expires_at | INTEGER | Unix timestamp (ms) when URL expires (null = never) |
| max_clicks | INTEGER | Maximum allowed clicks (null = unlimited) |

### `clicks` Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-incrementing primary key |
| short_id | TEXT | Foreign key to urls table |
| clicked_at | INTEGER | Unix timestamp (ms) of the click |
| user_agent | TEXT | Browser/client user agent string |
| referer | TEXT | HTTP referer header |

## Project Structure

```
shortleaf/
├── server.js          # Main Express application
├── db.js              # Database setup and queries
├── urls.db            # SQLite database (auto-generated)
├── package.json       # Dependencies
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Configuration

The server uses the following environment variables:

- `PORT` - Server port (default: 3000)

Example:
```bash
PORT=8080 node server.js
```

## Validation Rules

### URL Format
- Must start with `http://` or `https://`
- Must be a valid URL format

### Custom ID
- Length: 3-20 characters
- Allowed characters: letters (a-z, A-Z), numbers (0-9), hyphens (-), underscores (_)
- Must be unique

### Expiration
- `expiresInDays`: 1-365 days
- `maxClicks`: Must be a positive integer

## Future Enhancements

Potential features to add:
- Rate limiting for abuse prevention
- QR code generation
- Password-protected URLs
- Bulk URL shortening
- Web dashboard/UI
- API authentication
- Advanced analytics (geographic data, time-based charts)
- URL preview before redirect
