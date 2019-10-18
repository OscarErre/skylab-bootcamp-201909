function Login (container) {
    Component.call(this, container);
}

Login.extend(Component);

Login.prototype.onSubmit = function (callback) {
    this.container.addEventListener('submit', function (event) {
        event.preventDefault();

        callback(this.username.value === "Oscar" && this.password.value === "123");
    });
}

