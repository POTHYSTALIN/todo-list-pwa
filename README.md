# Todo List PWA - Client

This is the React frontend for the Todo List PWA. It's built with Create React App and configured as a Progressive Web App.

## Project Structure

```
src/
├── components/           # React components
│   ├── NetworkStatus.js  # Network status indicator
│   ├── TodoForm.js       # Form for adding/editing todos
│   ├── TodoItem.js       # Individual todo item
│   └── TodoList.js       # List of todos with filtering
├── contexts/             # React context
│   └── TodoContext.js    # Todo state management
├── utils/                # Utility functions
│   └── db.js             # IndexedDB functions
├── App.js                # Main application component
├── index.js              # Entry point with service worker registration
└── serviceWorkerRegistration.js  # Service worker registration
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## IndexedDB Usage

The app uses IndexedDB to store todos locally:

- **Database Name**: todo-list-db
- **Version**: 1
- **Object Store**: todos
- **Indexes**: completed, timestamp

This allows for:
- Persistent storage across browser sessions
- Offline data access
- Fast queries and updates

## Service Worker

The app uses a service worker to:
- Cache app assets for offline use
- Provide a fast, app-like experience
- Enable installation on supported devices

## PWA Features

This app implements the following PWA features:
- Offline capability
- Installable
- Responsive design
- Network status detection
- Fast loading 


To serve public URL
ngrok http 3000