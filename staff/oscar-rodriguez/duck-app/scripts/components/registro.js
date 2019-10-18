function Register (container) {
    Component.call(this, container);
    container.innerHTML ="";

    this.pintar = this.pintar.bind(this);
}

Register.extend(Component);

Register.prototype.onClick = undefined;

Register.prototype.pintar = function (item) {

    this.__container__.addEventListener('click', function () {
        var id = item.id

        this.onClick(id);
    }.bind(this))

    this.__container__.setAttribute('href','#'+item.id);

    var li = createElement('li','class',"search-list__entry entry");
    var img = createElement('img','class','entry__img','src',item.imageUrl);
    var title = createElement('div','class','entry__tittle',"innerHtml",item.title);
    var price = createElement('div',"innerHtml",item.price,"class","entry__price");

    li.append(img);
    li.append(title);
    li.append(price);
    this.__container__.append(li);
}