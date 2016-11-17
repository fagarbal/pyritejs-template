import pyrite from 'pyrite';
import pages from './pages';

pyrite('http://localhost:4000')
.route(pages)
.proxy((core, server) => {
	server.Example.getNumbers().then((data) => console.log(data));

	server.Example.sum(1,2).then((data) => console.log(data));

	server.Example.sum(8,7).then((data) => console.log(data));

	server.Example.formatName('Fabio', 'Garcia', 'Balbuena').then((data) => console.log(data));

	server.Example.formatName('Pepe', 'Hola', 'Where').then((data) => console.log(data));

	server.Asturias.getCities().then((data) => console.log(data));

	server.Location.getCities().then((data) => console.log(data));

	server.Example.setNumbers([4,5,6]);
});