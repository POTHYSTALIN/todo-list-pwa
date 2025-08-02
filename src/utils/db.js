import { openDB } from 'idb';

// Database name and version
const DB_NAME = 'todo-list-db';
const DB_VERSION = 3; // Increment version to trigger upgrade

// Default categories
const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: 'Work',
    description: 'Tasks related to your professional work',
    color: 'primary',
    count: 5
  },
  {
    id: 2,
    name: 'Personal',
    description: 'Personal tasks and errands',
    color: 'success',
    count: 3
  },
  {
    id: 3,
    name: 'Shopping',
    description: 'Shopping lists and purchases',
    color: 'warning',
    count: 2
  },
  {
    id: 4,
    name: 'Health',
    description: 'Health and fitness related tasks',
    color: 'info',
    count: 1
  }
];

// Initialize the database
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
      
      // Create the todos object store if it doesn't exist
      if (!db.objectStoreNames.contains('todos')) {
        console.log('Creating todos object store');
        const store = db.createObjectStore('todos', {
          keyPath: 'id',
          autoIncrement: true,
        });
        
        // Create all indexes for todos store
        store.createIndex('completed', 'completed');
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('priority', 'priority');
      }

      // Create the categories object store if it doesn't exist
      if (!db.objectStoreNames.contains('categories')) {
        console.log('Creating categories object store');
        const categoriesStore = db.createObjectStore('categories', {
          keyPath: 'id',
          autoIncrement: true,
        });
        
        // Create indexes for categories store
        categoriesStore.createIndex('name', 'name');
        categoriesStore.createIndex('color', 'color');
      }
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

// Category functions
export const addCategory = async (category) => {
  try {
    const db = await initDB();
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    const categoryWithTimestamp = {
      ...category,
      timestamp: new Date().getTime(),
    };
    console.log('Adding category to IndexedDB:', categoryWithTimestamp);
    const id = await store.add(categoryWithTimestamp);
    await tx.done;
    console.log('Category added successfully with ID:', id);
    return id;
  } catch (error) {
    console.error('Error adding category to IndexedDB:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction('categories', 'readonly');
    const store = tx.objectStore('categories');
    const categories = await store.getAll();
    console.log('Retrieved categories from IndexedDB:', categories);
    
    // If no categories exist, add default categories
    if (categories.length === 0) {
      console.log('No categories found, adding default categories...');
      const defaultTx = db.transaction('categories', 'readwrite');
      const defaultStore = defaultTx.objectStore('categories');
      
      for (const category of DEFAULT_CATEGORIES) {
        await defaultStore.add(category);
      }
      await defaultTx.done;
      console.log('Default categories added successfully');
      
      // Return the default categories
      return DEFAULT_CATEGORIES;
    }
    
    return categories;
  } catch (error) {
    console.error('Error getting categories from IndexedDB:', error);
    return [];
  }
};

export const getCategory = async (id) => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readonly');
  const store = tx.objectStore('categories');
  const category = await store.get(id);
  return category;
};

export const updateCategory = async (category) => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readwrite');
  const store = tx.objectStore('categories');
  await store.put(category);
  await tx.done;
};

export const deleteCategory = async (id) => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readwrite');
  const store = tx.objectStore('categories');
  await store.delete(id);
  await tx.done;
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