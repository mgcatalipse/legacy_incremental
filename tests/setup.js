// Jest setup file for configuring test environment
const { JSDOM } = require('jsdom');

// Create a minimal DOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Set up global variables that the game expects
global.$ = global.jQuery = require('jquery')(dom.window);

// Make sure jQuery is properly initialized with the window
global.window.$ = global.$;
global.window.jQuery = global.jQuery;