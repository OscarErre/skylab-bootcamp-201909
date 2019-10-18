function Results (container) {
    Component.call(this, container);
    container.innerHTML ="";

    this.pintar = this.pintar.bind(this);
}

Results.extend(Component);

Results.prototype.onItemRender = undefined;

Results.prototype.pintar = function (results_list) {
    this.container.innerHTML ="";
    results_list.forEach(function(item) {

        var register = this.onItemRender();

        register.pintar(item);

        this.add(register);
    }.bind(this));
}