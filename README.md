# odin-react

> Made with create-react-library

Component Library designed for Odin Control Interfaces. 

[![NPM](https://img.shields.io/npm/v/odin-react.svg)](https://www.npmjs.com/package/odin-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

### From Github Repository (recommended)

```bash
cd <project_dir>
npm install --save git@github.com:stfc-aeg/odin-react.git
```
### From Local Repository

Installing from a local copy is more complicated due to some issues with React linking, and is only recommended if absolutely necessary.

First, clone the odin-react rep, and set up the global npm directory for [Linking](https://docs.npmjs.com/cli/v9/commands/npm-link)
```bash
git clone ssh://git@github.com:stfc-aeg/odin-react.git <library_dir>
cd <library_dir>
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```
Link the Odin React library to your App

```bash
npm link
cd <project_dir>
npm link odin-react
npm link <library_dir>/node_modules/react --save
npm link <library_dir>/node_modules/react-dom --save
npm link <library_dir>/node_modules/react-scipts --save
npm link <library_dir>/node_modules/bootstrap --save
npm link <library_dir>/node_modules/react-bootstrap --save
```

Once done, check the `package.json` file within `<project_dir>`, and make sure the dependencies listed above show a relative path to the cloned library.
For instance:
```json
"dependencies": {
  "react": "file: <library_dir>/node_modules/react",
  ...
}

```

This should allow you to use the local copy of the Odin React library with your App, and allow for changes to the components to be quickly seen in the App.
## Usage

Basic React knowledge will be required to use this component library. Below are links to some useful tutorials
- https://reactjs.org/tutorial/tutorial.html

It's recommended that a React app is created using the [create-react-app](https://create-react-app.dev/) library to set up the initial version of the React App. This 

Additonally, react-bootstrap is required. See the following link for information on react-bootstrap.
- https://react-bootstrap.github.io/getting-started/introduction/

This git repository includes an Example app, along with an example odin-control adapter, that can be used as reference for how the components may look and interact with Odin Control.

See docs folder for info on each component

## Building an App

