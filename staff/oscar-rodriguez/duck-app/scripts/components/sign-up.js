function SignUp (container) {
    Component.call(this, container);
}

SignUp.extend(Component);

SignUp.prototype.onSubmit = function (callback) {
    this.container.addEventListener('submit', function (event) {
        event.preventDefault();

        var credentials =   {   "username"  :   this.username.value,
                                "password"  :   this.password.value,
                                "name"      :   this.name.value,
                                "surname"   :   this.surname.value
                            }
        callback(credentials);
    });
}

