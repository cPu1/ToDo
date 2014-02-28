/*global window, jQuery, Mustache, ToDo
*/
jQuery(function ($) {
	'use strict';
	/*var defaultTasks = [{
						name: 'Do this',
						description: 'nothing'
					}, {
						name: 'Do that',
						description: 'asdf'
					}, {
						name: 'Do nothing',
						description: 'what?'
					}],*/

	var elementsCache = function() {
		this.$taskName = $('#task-name');
		this.$taskDescription = $('#task-description');
		this.$taskFilter = $('#all, #done, #undone');
		this.$todoList = $('ul.todo-list');
		this.$addTodo = $('#add-todo');
		this.$newTodo = $('.new-todo');
		this.$toggleNew = $('#toggle-new');
		this.$editTask = $('.edit-task');
		/*this.$newTaskName = $('#new-task-name');
		this.$newDescription = $('#new-description');
		this.$saveTodo = $('#edit');
		this.$closeTodo = $('#ok');*/
		this.$editTaskTemplate = $('.edit-task').html();
		this.$todoTemplate = $("#todo-template").html();
	},
	storage = (function () {
		if(!window.localStorage) {
			return {set: $.noop, get: $.noop};
		}
		return {
			set: function (tasks) {
				localStorage.setItem('tasks', JSON.stringify(tasks));
			},
			get: function () {
				var tasks;
				return (tasks = localStorage.getItem('tasks')) && JSON.parse(tasks);
			}
		};
	}()),

	app = {
		init: function () {
			var todo = this.todo = new ToDo(storage.get());

			elementsCache.call(this);

			if(todo.hasTasks()) {
				this.renderList(todo.tasks);
				this.toggleNewTodo();
			}
			else {
				this.loadTasks();
			}
			

			$(document).on('change', 'ul.todo-list input[type=checkbox]', this.toggleTodo);

			this.$addTodo.on('click', this.addTodo);

			this.$taskFilter.on('click', this.filterTasks);

			this.$toggleNew.on('click', this.toggleNewTodo);

			$(document).on('click', '#edit', this.saveTodo);

			$(document).on('click', '#ok', this.closeEditTask);

			$(document).on('click', '.task span', this.editTodo);

			window.onpopstate = function (event) {
				app.renderList(event.tasks);
			};
		},
		loadTasks: function () {
			$.getJSON('todo.json').done(function (tasks) {
				app.todo.addTask(tasks.tasks);
				app.renderList(app.todo.tasks);
			});
		},
		addTodo: function () {
			var taskName = app.$taskName.val(),
					taskDescription = app.$taskDescription.val(),
					todo = app.todo;

			if(taskName && taskDescription) {
				todo.addTask({name: taskName, description: taskDescription});
				app.renderList(todo.tasks);
			}
		},
		toggleTodo: function () {
			var $checkbox = $(this),
						taskId = $checkbox.closest('li').data('id'),
						done = $checkbox.prop('checked'),
						task = app.todo.findById(taskId);

			task.done = done;
			app.renderList(app.todo.tasks);
		},
		toggleNewTodo: function () {
			var $newTodo = app.$newTodo,
					visible = $newTodo.is(':visible');
			this.value = visible? '+' : '-';
			$newTodo.toggle();
		},
		editTodo: function () {
			var $this = $(this),
					$taskDiv = $this.closest('div'),
					offset = $taskDiv.offset(),
					width = $taskDiv.outerWidth(),
					id = $this.closest('li').data('id'),
					task = app.todo.findById(id);

			offset.left += width + 25;
			app.renderEdit(task);
			app.$editTask
					.offset(offset)
					.show();
		},
		saveTodo: function () {
			var newName = $('#new-task-name').val(),
					newDescription = $('#new-description').val(),
					newTask = {name: newName, description: newDescription},
					taskId = $(this).data('id'),
					task = app.todo.findById(taskId);
			
			$.extend(task, newTask);
			app.renderList(app.todo.tasks);
		},
		closeEditTask: function () {
			var $editTask = app.$editTask;
			$editTask.offset({left: 0, top: 0});
			$editTask.hide();
		},

		filterTasks: function () {
			var command = this.id,
						tasks = app.todo[app.filterCommands[command]]();
			app.renderList(tasks);
			history.pushState(tasks, 'todo', command);
		},
		
		filterCommands: {
			done: 'findDone',
			undone: 'findUndone',
			all: 'findAll'
		},
		
		renderList: function (tasks) {
			var tmpl = Mustache.render(this.$todoTemplate, {task: tasks});
			this.$todoList.html(tmpl);
			storage.set(app.todo.tasks);

			/*var $todoList = $('ul.todo-list'),
					listTemplate = this.listTemplate;

			$todoList.empty();

			$.each(tasks, function () {
				var newList = $(this.listTemplate).data('id', task.id).find('span').text(task.name);
				var $newList = $(listTemplate),
						$span = $newList.find('span');

				$newList.data('id', this.id);
				$span.text(this.name);
				if(this.done) {
					$span.addClass('done');
				}
				$todoList.append($newList);
			});*/
		},
		renderEdit: function (task) {
			var tmpl = Mustache.render(this.$editTaskTemplate, task);
			this.$editTask.html(tmpl);
		}/*,

		listTemplate: '<li><div id="task"><input type="checkbox"/> <span></span></div></li>'*/

	};

	app.init();
});
