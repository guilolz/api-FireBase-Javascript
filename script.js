document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');
    const daySelect = document.getElementById('day-select');

    let draggedItem = null;

    function addTask() {
        const taskText = taskInput.value.trim();
        const selectedDay = daySelect.value;
        const dayMap = {
            'seg': 'Segunda-feira',
            'ter': 'Terça-feira',
            'qua': 'Quarta-feira',
            'qui': 'Quinta-feira',
            'sex': 'Sexta-feira',
            'sab': 'Sábado',
            'dom': 'Domingo'
        };

        if (taskText !== '') {
            const taskId = Date.now(); 
            set(ref(database, 'tasks/' + taskId), {
                text: taskText,
                day: dayMap[selectedDay] || 'Dia inválido',
                completed: false 
            }).then(() => {
                taskInput.value = ''; 
            }).catch((error) => {
                console.error('Error adding task:', error);
            });
        } else {
            console.log('O campo de entrada está vazio.');
        }
    }

    function addComment(taskId, commentText) {
        const commentId = Date.now(); 
        set(ref(database, 'tasks/' + taskId + '/comments/' + commentId), commentText)
            .catch((error) => {
                console.error('Error adding comment:', error);
            });
    }

    function removeComment(taskId, commentId) {
        remove(ref(database, 'tasks/' + taskId + '/comments/' + commentId));
    }

    function loadComments(taskId, commentsListElement) {
        const commentsRef = ref(database, 'tasks/' + taskId + '/comments');
        onValue(commentsRef, (snapshot) => {
            const data = snapshot.val();
            commentsListElement.innerHTML = '';
            if (data) {
                Object.keys(data).forEach(commentId => {
                    const commentText = data[commentId];
                    const li = document.createElement('li');
                    li.textContent = commentText;

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Remover';
                    deleteButton.classList.add('remove-comment-button');
                    deleteButton.addEventListener('click', () => {
                        removeComment(taskId, commentId);
                    });

                    li.appendChild(deleteButton);
                    commentsListElement.appendChild(li);
                });
            }
        }, (error) => {
            console.error('Error loading comments:', error);
        });
    }

    function loadTasks() {
        const tasksRef = ref(database, 'tasks');
        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            taskList.innerHTML = ''; 
            if (data) {
                Object.keys(data).forEach(taskId => {
                    const task = data[taskId];
                    const li = document.createElement('li');
                    li.classList.add('task-container');
                    li.setAttribute('draggable', 'true');
                    li.dataset.id = taskId; 
                    if (task.completed) {
                        li.classList.add('completed');
                    }

                    const taskContent = document.createElement('span');
                    taskContent.classList.add('task-content');
                    taskContent.textContent = task.text;

                    const taskDay = document.createElement('span');
                    taskDay.classList.add('task-day');
                    taskDay.textContent = task.day;

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Remover';
                    deleteButton.classList.add('remove-button');
                    deleteButton.addEventListener('click', () => {
                        removeTask(taskId);
                    });

                    const completeButton = document.createElement('button');
                    completeButton.textContent = task.completed ? 'Concluída' : 'Concluir';
                    completeButton.classList.add('complete-button');
                    completeButton.addEventListener('click', () => {
                        if (!task.completed) {
                            markAsCompleted(taskId);
                        }
                    });

                    // Seção de comentários
                    const commentsSection = document.createElement('div');
                    commentsSection.classList.add('comments-section');

                    const commentInput = document.createElement('input');
                    commentInput.classList.add('comment-input');
                    commentInput.placeholder = 'Adicionar um comentário';

                    const addCommentButton = document.createElement('button');
                    addCommentButton.classList.add('add-comment-button');
                    addCommentButton.textContent = 'Adicionar Comentário';
                    addCommentButton.addEventListener('click', () => {
                        addComment(taskId, commentInput.value.trim());
                        commentInput.value = ''; // Limpa o campo de input
                    });

                    const commentsList = document.createElement('ul');
                    commentsList.classList.add('comments-list');

                    commentsSection.appendChild(commentInput);
                    commentsSection.appendChild(addCommentButton);
                    commentsSection.appendChild(commentsList);

                    li.appendChild(taskContent);
                    li.appendChild(taskDay);
                    li.appendChild(deleteButton);
                    li.appendChild(completeButton);
                    li.appendChild(commentsSection);

                    taskList.appendChild(li);

                    // Carregar comentários
                    loadComments(taskId, commentsList);
                });
            }
        }, (error) => {
            console.error('Error loading tasks:', error);
        });
    }

    function removeTask(taskId) {
        remove(ref(database, 'tasks/' + taskId));
    }

    function markAsCompleted(taskId) {
        update(ref(database, 'tasks/' + taskId), { completed: true });
    }

    function loadTasks() {
        const tasksRef = ref(database, 'tasks');
        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            taskList.innerHTML = ''; // Limpa a lista atual
            if (data) {
                Object.keys(data).forEach(taskId => {
                    const task = data[taskId];
                    const li = document.createElement('li');
                    li.classList.add('task-container');
                    li.setAttribute('draggable', 'true');
                    li.dataset.id = taskId; // Definir ID da tarefa
                    if (task.completed) {
                        li.classList.add('completed'); // Adiciona classe para tarefas concluídas
                    }

                    const taskContent = document.createElement('span');
                    taskContent.classList.add('task-content');
                    taskContent.textContent = task.text;

                    const taskDay = document.createElement('span');
                    taskDay.classList.add('task-day');
                    taskDay.textContent = task.day;

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Remover';
                    deleteButton.classList.add('remove-button');
                    deleteButton.addEventListener('click', () => {
                        removeTask(taskId);
                    });

                    const completeButton = document.createElement('button');
                    completeButton.textContent = task.completed ? 'Concluída' : 'Concluir';
                    completeButton.classList.add('complete-button');
                    completeButton.addEventListener('click', () => {
                        if (!task.completed) {
                            markAsCompleted(taskId);
                        }
                    });

                    taskContent.appendChild(taskDay);
                    li.appendChild(taskContent);
                    li.appendChild(deleteButton);
                    li.appendChild(completeButton);
                    taskList.appendChild(li);
                });
            }
        }, (error) => {
            console.error('Error loading tasks:', error);
        });
    }

    addTaskButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    taskList.addEventListener('dragstart', (e) => {
        if (e.target && e.target.classList.contains('task-container')) {
            draggedItem = e.target;
            draggedItem.classList.add('dragging');
        }
    });

    
    taskList.addEventListener('dragend', (e) => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;

            const placeholders = document.querySelectorAll('.placeholder');
            placeholders.forEach(placeholder => placeholder.classList.remove('placeholder'));
        }
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggedItem);
        } else {
            taskList.insertBefore(draggedItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-container:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    loadTasks();
});
