class PyriteCore {
	constructor() {
		this.components = {};
		this.services = {};
	}

	addService(controller, params) {
		let services = [];

		for (let serviceName of params.inject) {
			services.push(this.services[serviceName]);
		}

		this.services[params.alias] = new controller(...services);
	}

	addComponent(controller, params) {		
		this.components[params.selector] = {
			controller: controller || class {},
			template: params.template || '',
			selector: params.selector,
			inject: params.inject || [],
			require: params.require || []
		};
	}

	setIncludes(element, content) {
		let includes = element.getElementsByTagName('include');

		for (let include of includes) {
			include.innerHTML = content.innerHTML;
		}
	}

	toCamelCase(str) {
		return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
	}

	toDash(str) {
		return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	}

	getValue(column, path) {
		return path.split('.').reduce((object, x) => {
			if (object) return object[x];
			return null;
		}, column);
	}

	getWordsBetweenCurlies(str) {
		var results = [],
			re = /{{([^}}]+)}}/g,
			text;

		while (text = re.exec(str)) {
			results.push(text[1]);
		}

		return Array.from(new Set(results));
	}

	instanceController(component, parents) {
		let services = [];

		for (let serviceName of this.components[component].inject) {
			services.push(this.services[serviceName]);
		}

		for(let parent of this.components[component].require) {
			this.components[component].controller.prototype[this.toCamelCase(parent)] = parents[parent];
		}

		return new this.components[component].controller(...services);
	}

	getTemplateWithController(component, parents = {}) {
		let controller = this.instanceController(component, parents);

		parents[component] = controller;

		let template = this.components[component].template;

		const variables = this.getWordsBetweenCurlies(template);

		const templateProperties = variables.filter((element) => element.indexOf('(') < 0);
		const templateMethods = variables.filter((element) => element.indexOf('(') >= 0);

		this.components[component].templateProperties = templateProperties;
		this.components[component].templateMethods = templateMethods;

		for (let methodName of templateMethods){
			template = template.split(`{{${methodName}}}`).join(this.getValue(controller, methodName.replace('()', ''))());
		}

		for (let propertyName of templateProperties){
			template = template.split(`{{${propertyName}}}`).join(this.getValue(controller, propertyName));
		}

		return [template, controller];
	}

	setAttributes(element, controller) {
		for (let children of element.children) {
			let clickMethod = children.getAttribute('(click)');
			if (!clickMethod) continue;
			let method = clickMethod.replace('()', '');
			children.addEventListener('click', this.getValue(controller, method).bind(controller[method.split('.')[0]]));
		}
	}

	setTemplate(component, elements, parents) {
		for (let element of elements) {
			let content = element.cloneNode(true);

			let [template, controller] = this.getTemplateWithController(component, parents);

			element.innerHTML = template;

			this.setAttributes(element, controller);

			this.setIncludes(element, content);
			this.renderComponents(element, parents);
		}
	}

	renderComponents(element, parents = {}) {
		for (let component in this.components) {
			let elements = element.getElementsByTagName(component);

			if (!elements.length) continue;

			this.setTemplate(component, elements, parents);
		}
	}

	run() {
		window.addEventListener('DOMContentLoaded', (event) => {
			this.renderComponents(document);
		});
	}
}

export default new PyriteCore();