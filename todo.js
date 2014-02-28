/*global $*/
function ToDo(tasks) {
	this.tasks = tasks || [];
}


ToDo.prototype.addTask = function (tasks) {
	tasks = Array.isArray(tasks)? tasks : [tasks];
	tasks.forEach(function (task) {
		var defaultTask = {done: false, id: this._uniqId()};
		$.extend(defaultTask, task);
		this.tasks.push(defaultTask);
	}, this);

	return this.tasks;
};

ToDo.prototype._find = function (done) {
	return this.tasks.filter(function (task) {
		return task.done === done;
	});
};

ToDo.prototype.findDone = function () {
	return this._find(true);
};
ToDo.prototype.findUndone = function () {
	return this._find(false);
};
ToDo.prototype.findAll = function () {
	return this.tasks;
};
ToDo.prototype.findById = function (id) {
	var item;
	$.each(this.tasks, function () {
		if(this.id === id) {
			item = this;
			return false;
		}
	});
	return item;
};

ToDo.prototype.toggle = function (id) {
	var task = this.findById(id);
	task.done = !task.done;
};

ToDo.prototype._uniqId = function () {
	return Math.floor(Math.random() * 1000);
};

ToDo.prototype.hasTasks = function () {
	return !!this.tasks.length;
};