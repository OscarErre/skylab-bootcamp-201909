function Detail (container) {
    Component.call(this, container);
    container.innerHTML ="";

    this.pintar = this.pintar.bind(this);
}

Detail.extend(Component);

Detail.prototype.empty = function () {
    this.__container__.innerHTML ="";
}

Detail.prototype.add = function (element) {
    this.__container__.append(element);
}

Detail.prototype.onBack = undefined;

Detail.prototype.pintar = function (item) {
    var title = createElement("h1",'class','duck-detail__title','innerHtml',item.title);
    var description = createElement("p","class","duck-detail__description","innerHtml",item.description);
    var image = createElement("img",'class',"duck-detail__image",'src',item.imageUrl);
    var price = createElement("div",'class','duck-detail__price','innerHtml',item.price);
    var link = createElement("a", 'class','link',"innerHtml","Go to Duck's shopping page","href",item.link);

    var back = createElement("button","innerHtml","Atrás",'class','duck-detail__back');
    back.addEventListener('click', this.onBack);

    this.add(title);
    this.add(back);
    this.add(description);
    this.add(image);
    this.add(price);
    this.add(link);
}