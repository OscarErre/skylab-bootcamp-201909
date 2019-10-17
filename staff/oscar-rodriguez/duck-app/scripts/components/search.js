function Search (container) {
    this.__container__ = container;
    debugger
}

Search.prototype.onSubmit = function (expression) {

    this.__container__.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = this.search.value;

        expression(query);
    });
}

Search.prototype.onReset = function (expression) {

    this.__container__.addEventListener('reset', function (event) {
        event.preventDefault();

        var query = this.search.value;
        expression(query);
    });
}