import { openDB } from 'idb';

// Database name and version
const DB_NAME = 'todo-list-db';
const DB_VERSION = 2; // Increment version to trigger upgrade

// Initialize the database
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
      
      // Create the object store if it doesn't exist
      if (!db.objectStoreNames.contains('todos')) {
        console.log('Creating todos object store');
        const store = db.createObjectStore('todos', {
          keyPath: 'id',
          autoIncrement: true,
        });
        
        // Create all indexes for new stores
        store.createIndex('completed', 'completed');
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('priority', 'priority');
      }
      // For existing stores, the priority index will be added automatically
      // when we try to access it, so we don't need to handle it here
    },
  });
  
  return db;
};

// Add a todo
export const addTodo = async (todo) => {
  try {
    const db = await initDB();
    const tx = db.transaction('todos', 'readwrite');
    const store = tx.objectStore('todos');
    const todoWithTimestamp = {
      ...todo,
      timestamp: new Date().getTime(),
    };
    console.log('Adding todo to IndexedDB:', todoWithTimestamp);
    const id = await store.add(todoWithTimestamp);
    await tx.done;
    console.log('Todo added successfully with ID:', id);
    return id;
  } catch (error) {
    console.error('Error adding todo to IndexedDB:', error);
    throw error;
  }
};

// Get all todos
export const getAllTodos = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction('todos', 'readonly');
    const store = tx.objectStore('todos');
    const todos = await store.getAll();
    console.log('Retrieved todos from IndexedDB:', todos);
    
    // Migrate existing todos to include priority field if missing
    const migratedTodos = todos.map(todo => {
      if (!todo.hasOwnProperty('priority')) {
        return { ...todo, priority: 'Medium' };
      }
      return todo;
    });
    
    // Update todos in database if migration was needed
    if (migratedTodos.some(todo => !todos.find(original => original.id === todo.id && original.priority === todo.priority))) {
      console.log('Migrating existing todos to include priority field...');
      const updateTx = db.transaction('todos', 'readwrite');
      const updateStore = updateTx.objectStore('todos');
      
      for (const todo of migratedTodos) {
        if (!todos.find(original => original.id === todo.id && original.priority === todo.priority)) {
          await updateStore.put(todo);
        }
      }
      await updateTx.done;
      console.log('Migration completed');
    }
    
    return migratedTodos;
  } catch (error) {
    console.error('Error getting todos from IndexedDB:', error);
    return [];
  }
};

// Get a specific todo by id
export const getTodo = async (id) => {
  const db = await initDB();
  const tx = db.transaction('todos', 'readonly');
  const store = tx.objectStore('todos');
  const todo = await store.get(id);
  return todo;
};

// Update a todo
export const updateTodo = async (todo) => {
  const db = await initDB();
  const tx = db.transaction('todos', 'readwrite');
  const store = tx.objectStore('todos');
  await store.put(todo);
  await tx.done;
};

// Delete a todo
export const deleteTodo = async (id) => {
  const db = await initDB();
  const tx = db.transaction('todos', 'readwrite');
  const store = tx.objectStore('todos');
  await store.delete(id);
  await tx.done;
};

// Get todos by completion status
export const getTodosByStatus = async (completed) => {
  const db = await initDB();
  const tx = db.transaction('todos', 'readonly');
  const store = tx.objectStore('todos');
  const index = store.index('completed');
  const todos = await index.getAll(completed);
  return todos;
};

// Export todos as CSV
export const exportTodosAsCSV = async () => {
  const todos = await getAllTodos();
  
  // Define the column headers
  const headers = ['id', 'title', 'description', 'priority', 'completed', 'timestamp'];
  
  // Convert the data to CSV format
  const csvContent = [
    // Add the headers
    headers.join(','),
    
    // Add the data rows
    ...todos.map(todo => {
      return [
        todo.id,
        `"${todo.title.replace(/"/g, '""')}"`, // Escape quotes in title
        `"${(todo.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
        todo.priority || 'Medium', // Default to Medium if no priority
        todo.completed ? 'true' : 'false',
        new Date(todo.timestamp).toISOString()
      ].join(',');
    })
  ].join('\n');
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Set the link's attributes
  link.setAttribute('href', url);
  link.setAttribute('download', `todo-list-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  // Add the link to the DOM
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}; 