class PyriteCore {
	constructor() {
		this.components = {};
		this.services = {};
		this.ids = 0;
		this.controllers = [0];
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
			require: params.require || [],
			as: params.as || '$ctrl'
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

		this.components[component].controller.prototype[this.components[component].as] = this.components[component].controller.prototype;

		return new this.components[component].controller(...services);
	}

	getTemplateWithController(component, parents = {}) {
		let controller = null;

		if (this.controllers[this.components[component].id]) {
			controller = this.controllers[this.components[component].id];
		} else {
			controller = this.instanceController(component, parents);
			this.components[component].id = ++this.ids;
			this.controllers.push(controller);
		}

		parents[component] = controller;

		let template = this.components[component].template;

		const variables = this.getWordsBetweenCurlies(template);

		this.components[component].templateProperties = variables;

		const fn = (ctrl, component, method, core) => {
			const ctrlAs = core.components[component].as;
			const evalString = `
				let ${ctrlAs} = arguments[0];
				${method};`

			return eval(evalString);
		};

		for (let propertyName of variables){
			template = template.split(`{{${propertyName}}}`).join(fn.call(controller, controller, component, propertyName, this));
		}

		return [template, controller];
	}

	setAttributes(element, controller, component) {
		for (let children of element.children) {
			this.setAttributes(children, controller, component);

			const attributes = new Array(...children.attributes);

			const filteredAttributes = attributes.filter((attr) => {
				return attr.name.indexOf('(') >= 0;
			});

			if (!filteredAttributes.length) continue;

			const fn = (ctrl, component, method, children, elem, core, event) => {
				const ctrlAs = core.components[component].as;
				const evalString = `
					let ${ctrlAs} = arguments[0];
					let $element = arguments[3];
					let $event = arguments[5];
					${method};`
				const result = eval(evalString);
				this.renderComponents(elem.parentElement.parentElement);

				return result;
			};

			for (let attribute of filteredAttributes) {
				const attributeName = attribute.name.replace(/\(|\)/g, '');
				const clickMethod = attribute.value;

				children.addEventListener(attributeName, fn.bind(this, controller, component, clickMethod, children, element, this));
			}
		}
	}

	setTemplate(component, elements, parents) {
		for (let element of elements) {
			let content = element.cloneNode(true);

			let [template, controller] = this.getTemplateWithController(component, parents);

			element.innerHTML = template;

			this.setAttributes(element, controller, component);

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