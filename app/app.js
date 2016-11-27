// import pyrite from 'pyrite';
// import pages from './pages';

// pyrite('http://localhost:4000')
// .route(pages)
// .proxy((core, server) => {
// 	server.Example.getNumbers().then((data) => console.log(data));

// 	server.Example.sum(1,2).then((data) => console.log(data));

// 	server.Example.sum(8,7).then((data) => console.log(data));

// 	server.Example.formatName('Fabio', 'Garcia', 'Balbuena').then((data) => console.log(data));

// 	server.ExampleformatName('Pepe', 'Hola', 'Where').then((data) => console.log(data));

// 	server.Asturias.getCities().then((data) => console.log(data));

// 	server.Location.getCities().then((data) => console.log(data));

// 	server.Example.setNumbers([4,5,6]);

// 	server.Example.divide(0, 4)
// 	.then((data) => console.log(data))
// 	.catch((error) => {
// 		console.log(error)
// 	});
// });

class Components {
	constructor() {
		this.components = {};
	}

	addComponent(component, params) {
		this.components[params.selector] = {
			component: component,
			params: params
		};
	}

	getComponents() {
		console.log(this.components);
	}
}

var components = new Components();

components.getComponents();

function Component(params) {
  return function(Component) {
    components.addComponent(new Component(), params);
  }
}

@Component({
	template: "meow",
	selector: 'cat'
})
class Cat {
	meow() {
		return 'meow';
	}
}

@Component({
	template: "guau",
	selector: 'dog'
})
class Dog {
	guau() {
		return 'guau';
	}
}

components.getComponents();



