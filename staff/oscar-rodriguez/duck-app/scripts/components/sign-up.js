function SignUp (container) {
    Component.call(this, container);
}

SignUp.extend(Component);

SignUp.prototype.onSubmit = function (callback) {
    this.container.addEventListener('submit', function (event) {
        event.preventDefault();

        callback(this.username.value === "mail@mail.com" && this.password.value === "123");
    });
}

