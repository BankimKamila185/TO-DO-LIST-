document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const totalTasksSpan = document.getElementById('total-tasks');
    const completedTasksSpan = document.getElementById('completed-tasks');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    console.log('Loaded todos from localStorage:', todos);
    
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('Loaded theme preference:', savedTheme);
    
    // Track editing state
    let currentlyEditing = null;
    
    // Render initial todos
    renderTodos();
    updateStats();
    
    // Add event listeners
    addButton.addEventListener('click', addTodo);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', toggleTheme);
    
    // Function to add a new todo
    function addTodo() {
        const taskText = taskInput.value.trim();
        
        if (taskText === '') {
            console.warn('Attempted to add empty task');
            taskInput.classList.add('shake');
            setTimeout(() => taskInput.classList.remove('shake'), 500);
            return;
        }
        
        // Get the selected date or set to empty if not selected
        const dueDate = dateInput.value || '';
        
        // If we're editing a task
        if (currentlyEditing) {
            console.log('Updating todo:', currentlyEditing);
            // Update the todo with new text and date
            todos = todos.map(todo => {
                if (todo.id === currentlyEditing) {
                    return { ...todo, text: taskText, dueDate: dueDate };
                }
                return todo;
            });
            
            // Reset editing state
            currentlyEditing = null;
            addButton.textContent = 'Add';
        } else {
            // Create new todo object
            const todo = {
                id: Date.now(),
                text: taskText,
                completed: false,
                dueDate: dueDate
            };
            
            console.log('Adding new todo:', todo);
            
            // Add to todos array
            todos.push(todo);
        }
        
        // Save to localStorage
        saveTodos();
        
        // Render updated todos
        renderTodos();
        updateStats();
        
        // Clear inputs
        taskInput.value = '';
        dateInput.value = '';
        taskInput.focus();
    }
    
    // Function to toggle todo completion status
    function toggleComplete(id) {
        console.log('Toggling completion for todo ID:', id);
        todos = todos.map(todo => {
            if (todo.id === id) {
                console.log(`Changing todo '${todo.text}' completed status from ${todo.completed} to ${!todo.completed}`);
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        saveTodos();
        renderTodos();
        updateStats();
    }
    
    // Function to edit a todo
    function editTodo(id) {
        console.log('Editing todo ID:', id);
        const todoToEdit = todos.find(todo => todo.id === id);
        
        if (todoToEdit) {
            // Set input value to current todo text
            taskInput.value = todoToEdit.text;
            
            // Set date input if there's a due date
            if (todoToEdit.dueDate) {
                dateInput.value = todoToEdit.dueDate;
            }
            
            taskInput.focus();
            
            // Change add button to update button
            addButton.textContent = 'Update';
            
            // Set currently editing ID
            currentlyEditing = id;
        }
    }
    
    // Function to delete a todo
    function deleteTodo(id) {
        console.log('Deleting todo ID:', id);
        const todoToDelete = todos.find(todo => todo.id === id);
        if (todoToDelete) {
            console.log(`Deleting todo: '${todoToDelete.text}'`);
        }
        
        todos = todos.filter(todo => todo.id !== id);
        
        // If we were editing this todo, reset editing state
        if (currentlyEditing === id) {
            currentlyEditing = null;
            addButton.textContent = 'Add';
            taskInput.value = '';
        }
        
        saveTodos();
        renderTodos();
        updateStats();
    }
    
    // Function to cancel editing
    function cancelEdit() {
        console.log('Canceling edit mode');
        currentlyEditing = null;
        addButton.textContent = 'Add';
        taskInput.value = '';
        dateInput.value = '';
        taskInput.focus();
    }
    
    // Function to format dates in a nice readable format
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
    
    // Function to render todos
    function renderTodos() {
        console.log('Rendering todos list');
        todoList.innerHTML = '';
        
        // Show/hide empty state
        if (todos.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
        
        todos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.className = 'todo-item';
            
            // Create checkbox
            const checkbox = document.createElement('div');
            checkbox.className = `todo-checkbox ${todo.completed ? 'completed' : ''}`;
            checkbox.innerHTML = '<i class="fas fa-check"></i>';
            checkbox.addEventListener('click', () => toggleComplete(todo.id));
            
            // Create todo info container
            const todoInfo = document.createElement('div');
            todoInfo.className = 'todo-info';
            
            // Create todo text
            const todoText = document.createElement('span');
            todoText.className = `todo-text ${todo.completed ? 'completed' : ''}`;
            todoText.textContent = todo.text;
            
            // Create date display if due date exists
            if (todo.dueDate) {
                const todoDate = document.createElement('span');
                todoDate.className = 'todo-date';
                
                // Format the date nicely
                const formattedDate = formatDate(todo.dueDate);
                todoDate.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formattedDate}`;
                
                // Add date to todo info
                todoInfo.appendChild(todoText);
                todoInfo.appendChild(todoDate);
            } else {
                // Just add the text if no date
                todoInfo.appendChild(todoText);
            }
            
            // Create action buttons container
            const actions = document.createElement('div');
            actions.className = 'todo-actions';
            
            // Create edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.addEventListener('click', () => editTodo(todo.id));
            
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            
            // Append all elements to todo item
            todoItem.appendChild(checkbox);
            todoItem.appendChild(todoInfo);
            todoItem.appendChild(actions);
            
            // Append action buttons
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            // Append todo item to list
            todoList.appendChild(todoItem);
        });
        
        // Create cancel button if in edit mode
        if (currentlyEditing) {
            if (!document.getElementById('cancel-edit')) {
                const cancelButton = document.createElement('button');
                cancelButton.id = 'cancel-edit';
                cancelButton.textContent = 'Cancel';
                cancelButton.addEventListener('click', cancelEdit);
                
                // Insert before the add button
                addButton.parentNode.insertBefore(cancelButton, addButton.nextSibling);
            }
        } else {
            // Remove cancel button if it exists
            const existingCancelButton = document.getElementById('cancel-edit');
            if (existingCancelButton) {
                existingCancelButton.remove();
            }
        }
    }
    
    // Function to update task statistics
    function updateStats() {
        const totalTasks = todos.length;
        const completedTasks = todos.filter(todo => todo.completed).length;
        
        totalTasksSpan.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
        completedTasksSpan.textContent = `${completedTasks} completed`;
    }
    
    // Function to save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
        console.log('Saved todos to localStorage:', todos);
    }
    
    // Function to toggle between light and dark theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        console.log(`Theme switched from ${currentTheme} to ${newTheme}`);
    }
});