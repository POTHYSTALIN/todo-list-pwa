import { openDB } from 'idb';

// Database name and version
const DB_NAME = 'todo-list-db';
const DB_VERSION = 6; // Increment version to trigger upgrade

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
        store.createIndex('category', 'category');
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

      // Create the integrations object store if it doesn't exist
      if (!db.objectStoreNames.contains('integrations')) {
        console.log('Creating integrations object store');
        db.createObjectStore('integrations', {
          keyPath: 'key',
        });
      }

      // Create the settings object store if it doesn't exist
      if (!db.objectStoreNames.contains('settings')) {
        console.log('Creating settings object store');
        db.createObjectStore('settings', {
          keyPath: 'key',
        });
      }
    },
  });
  
  return db;
};

// Get database instance (helper for direct DB access)
export const getDB = async () => {
  return await initDB();
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
    
    // Migrate existing todos to include priority and category fields if missing
    const migratedTodos = todos.map(todo => {
      let updated = false;
      let migratedTodo = { ...todo };
      
      if (!todo.hasOwnProperty('priority')) {
        migratedTodo.priority = 'Medium';
        updated = true;
      }
      
      if (!todo.hasOwnProperty('category')) {
        migratedTodo.category = null; // Default to no category
        updated = true;
      }
      
      return migratedTodo;
    });
    
    // Update todos in database if migration was needed
    if (migratedTodos.some(todo => {
      const original = todos.find(t => t.id === todo.id);
      return !original || 
             original.priority !== todo.priority || 
             original.category !== todo.category;
    })) {
      console.log('Migrating existing todos to include priority and category fields...');
      const updateTx = db.transaction('todos', 'readwrite');
      const updateStore = updateTx.objectStore('todos');
      
      for (const todo of migratedTodos) {
        const original = todos.find(t => t.id === todo.id);
        if (!original || 
            original.priority !== todo.priority || 
            original.category !== todo.category) {
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

// Clear all todos
export const clearTodos = async () => {
  const db = await initDB();
  const tx = db.transaction('todos', 'readwrite');
  const store = tx.objectStore('todos');
  await store.clear();
  await tx.done;
};

// Import todos (replace all with new data)
export const syncTodosOnDB = async (todos) => {
  const db = await initDB();
  
  // First transaction: clear existing todos
  const clearTx = db.transaction('todos', 'readwrite');
  await clearTx.objectStore('todos').clear();
  await clearTx.done;
  
  // Second transaction: add new todos with auto-generated IDs
  const addTx = db.transaction('todos', 'readwrite');
  const store = addTx.objectStore('todos');
  for (const todo of todos) {
    // Remove id to let IndexedDB auto-generate sequential IDs
    const { id, ...todoWithoutId } = todo;
    await store.add(todoWithoutId);
  }
  await addTx.done;
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

// Get todos by category
export const getTodosByCategory = async (categoryId) => {
  const db = await initDB();
  const tx = db.transaction('todos', 'readonly');
  const store = tx.objectStore('todos');
  const index = store.index('category');
  const todos = await index.getAll(categoryId);
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

// Clear all categories
export const clearCategories = async () => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readwrite');
  const store = tx.objectStore('categories');
  await store.clear();
  await tx.done;
};

// Import categories (replace all with new data)
export const syncCategoriesOnDB = async (categories) => {
  const db = await initDB();
  
  // First transaction: clear existing categories
  const clearTx = db.transaction('categories', 'readwrite');
  await clearTx.objectStore('categories').clear();
  await clearTx.done;
  
  // Second transaction: add new categories with auto-generated IDs
  const addTx = db.transaction('categories', 'readwrite');
  const store = addTx.objectStore('categories');
  for (const category of categories) {
    // Remove id to let IndexedDB auto-generate sequential IDs
    const { id, ...categoryWithoutId } = category;
    await store.add(categoryWithoutId);
  }
  await addTx.done;
};

// Integrations functions
export const getAllIntegrations = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction('integrations', 'readonly');
    const store = tx.objectStore('integrations');
    const integrations = await store.getAll();
    return integrations;
  } catch (error) {
    console.error('Error getting integrations from IndexedDB:', error);
    return [];
  }
};

export const getIntegration = async (key) => {
  try {
    const db = await initDB();
    const tx = db.transaction('integrations', 'readonly');
    const store = tx.objectStore('integrations');
    const integration = await store.get(key);
    return integration ? integration.value : null;
  } catch (error) {
    console.error('Error getting integration from IndexedDB:', error);
    return null;
  }
};

export const saveIntegration = async (key, value) => {
  try {
    const db = await initDB();
    const tx = db.transaction('integrations', 'readwrite');
    const store = tx.objectStore('integrations');
    await store.put({ key, value, timestamp: new Date().getTime() });
    await tx.done;
    console.log('Integration saved:', key, value);
  } catch (error) {
    console.error('Error saving integration to IndexedDB:', error);
    throw error;
  }
};

export const deleteIntegration = async (key) => {
  try {
    const db = await initDB();
    const tx = db.transaction('integrations', 'readwrite');
    const store = tx.objectStore('integrations');
    await store.delete(key);
    await tx.done;
    console.log('Integration deleted:', key);
  } catch (error) {
    console.error('Error deleting integration from IndexedDB:', error);
    throw error;
  }
};

// Export todos as CSV
export const exportTodosAsCSV = async () => {
  const todos = await getAllTodos();
  
  // Define the column headers
  const headers = ['id', 'title', 'description', 'priority', 'category', 'completed', 'timestamp'];
  
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
        todo.category || 'None', // Default to None if no category
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

// Settings functions
export const getAllSettings = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const settings = await store.getAll();
    return settings;
  } catch (error) {
    console.error('Error getting settings from IndexedDB:', error);
    return [];
  }
};

export const getSetting = async (key) => {
  try {
    const db = await initDB();
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const setting = await store.get(key);
    return setting ? setting.value : null;
  } catch (error) {
    console.error('Error getting setting from IndexedDB:', error);
    return null;
  }
};

export const saveSetting = async (key, value) => {
  try {
    const db = await initDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    await store.put({ key, value, timestamp: new Date().getTime() });
    await tx.done;
    console.log('Setting saved:', key, value);
  } catch (error) {
    console.error('Error saving setting to IndexedDB:', error);
    throw error;
  }
};

export const deleteSetting = async (key) => {
  try {
    const db = await initDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    await store.delete(key);
    await tx.done;
    console.log('Setting deleted:', key);
  } catch (error) {
    console.error('Error deleting setting from IndexedDB:', error);
    throw error;
  }
}; 