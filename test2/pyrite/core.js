import utils from './utils.js';

class PyriteCore {
	constructor() {
		this.components = {};
		this.componentsNames = [];
		this.componentsIds = {};
		this.componentsInstances = {};
		this.componentsPromises = [];

		this.services = {};
		this.servicesPromises = [];
	}

	addService(controller, params) {
		let services = [];

		for (let serviceName of params.inject) {
			services.push(this.services[serviceName]);
		}

		this.services[params.alias] = new controller(...services);
	}

	addComponent(controller, params) {
		const selector = params.selector.toUpperCase();

		if (!this.componentsNames.includes(selector)) {
			this.componentsNames.push(selector);
		}

		this.components[selector] = {
			controller: controller || class {},
			template: params.template || '',
			selector: selector,
			inject: params.inject || [],
			as: params.as || '$ctrl'
		};
	}

	fillComponentTemplate(componentObject, id) {
		return componentObject.template;
	}

	getInjectedServices(servicesNames) {
		let services = [];

		for (let serviceName in this.services) {
			if (!servicesNames.includes(serviceName)) continue;

			services.push(this.services[serviceName]);
		}

		return services;
	}

	setParent(componentObject) {
		if (componentObject.parent) {
			const parentName = componentObject.parent.constructor.name;
			componentObject.controller.prototype[utils.toCamelCase(parentName)] = componentObject.parent;
		}
	}

	instanceComponent(componentObject, id) {
		if (!this.componentsInstances[componentObject.selector]) {
			this.componentsInstances[componentObject.selector] = {};
		}

		if (this.componentsInstances[componentObject.selector][id]) return;

		let services = this.getInjectedServices(componentObject.inject);

		this.setParent(componentObject);

		this.componentsInstances[componentObject.selector][id] = new componentObject.controller(...services);
	}

	getCurrentComponentByName(name) {
		return this.componentsInstances[name][this.componentsIds[name] - 1];
	}

	renderComponentInElement(element, componentObject, id) {
		this.instanceComponent(componentObject, id);
		element.innerHTML = this.fillComponentTemplate(componentObject, id);
	}

	prepareComponentsToRender(element, parentComponent = null) {
		for (let children of element.children) {
			const componentName = children.nodeName;

			if (this.componentsNames.includes(componentName)) {
				if (!this.componentsIds[componentName]) {
					this.componentsIds[componentName] = 0;
				}

				this.components[componentName].parent = parentComponent;

				this.componentsPromises.push(this.renderComponentInElement(children, this.components[componentName], this.componentsIds[componentName]));

				this.componentsIds[componentName]++;

				this.prepareComponentsToRender(children, this.getCurrentComponentByName(componentName));
			}
		}
	}

	run() {
		window.addEventListener('DOMContentLoaded', (event) => {
			Promise.all(this.servicesPromises)
			.then((services) => {
				this.instanceServices = services;
				this.prepareComponentsToRender(document.body);
				return Promise.all(this.componentsPromises);
			})
		});
	}
}

export default new PyriteCore();