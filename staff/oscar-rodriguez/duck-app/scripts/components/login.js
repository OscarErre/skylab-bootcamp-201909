function Login (container) {
    Component.call(this, container);
}

Login.extend(Component);

Login.prototype.onSubmit = function (callback) {
    this.container.addEventListener('submit', function (event) {
        event.preventDefault();
        var credentials =   {   "username"  :   this.username.value,
                                "password"   :   this.password.value
                            }
        callback(credentials);
    });
}

