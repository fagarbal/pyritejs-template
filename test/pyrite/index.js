import pyriteCore from './core.js';

export const Component = (params) => {
  	return (controller) => {
    	pyriteCore.addComponent(controller, params);
  	};
};

export const Service = (params) =>  {
  	return (controller) => {
    	pyriteCore.addService(controller, params);
  	};
};

class AppClass {
    run() {
		pyriteCore.run();
	}
};

export const App = new AppClass();